package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/go-pdf/fpdf"
	"github.com/supabase-community/supabase-go"
)

type FormRequest struct {
	JobID    string `json:"jobId"`
	UserID   string `json:"userId"`
	FormType string `json:"formType"`
}

type Transaction struct {
	ID       string    `json:"id"`
	Date     time.Time `json:"date"`
	Amount   float64   `json:"amount"`
	Merchant string    `json:"merchant"`
	Category string    `json:"category"`
}

type CategoryTotal struct {
	Category string
	Total    float64
	Count    int
}

var (
	supabaseURL = os.Getenv("SUPABASE_URL")
	supabaseKey = os.Getenv("SUPABASE_SERVICE_ROLE_KEY")
)

func main() {
	http.HandleFunc("/generate-form", handleGenerateForm)
	http.HandleFunc("/health", handleHealth)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		log.Fatal(err)
	}
}

func handleHealth(w http.ResponseWriter, r *http.Request) {
	w.WriteHeader(http.StatusOK)
	json.NewEncoder(w).Encode(map[string]string{"status": "healthy"})
}

func handleGenerateForm(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req FormRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request", http.StatusBadRequest)
		return
	}

	// Start processing in background
	go processFormGeneration(req)

	w.WriteHeader(http.StatusAccepted)
	json.NewEncoder(w).Encode(map[string]string{"status": "processing"})
}

func processFormGeneration(req FormRequest) {
	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Printf("Failed to create Supabase client: %v", err)
		updateJobStatus(req.JobID, "error", "Failed to connect to database")
		return
	}

	// Fetch user transactions
	var transactions []Transaction
	err = client.From("transactions").
		Select("*").
		Eq("user_id", req.UserID).
		Execute(&transactions)
	if err != nil {
		log.Printf("Failed to fetch transactions: %v", err)
		updateJobStatus(req.JobID, "error", "Failed to fetch transactions")
		return
	}

	// Generate the form based on type
	var pdfBytes []byte
	switch req.FormType {
	case "schedule_c":
		pdfBytes, err = generateScheduleC(transactions)
	case "1099":
		pdfBytes, err = generate1099Forms(transactions)
	default:
		err = fmt.Errorf("unknown form type: %s", req.FormType)
	}

	if err != nil {
		log.Printf("Failed to generate form: %v", err)
		updateJobStatus(req.JobID, "error", fmt.Sprintf("Failed to generate form: %v", err))
		return
	}

	// Upload to storage
	fileName := fmt.Sprintf("%s/%s_%s.pdf", req.UserID, req.FormType, time.Now().Format("20060102_150405"))
	uploadURL, err := uploadToStorage(pdfBytes, fileName)
	if err != nil {
		log.Printf("Failed to upload form: %v", err)
		updateJobStatus(req.JobID, "error", "Failed to upload form")
		return
	}

	// Update job status with result URL
	updateJobStatusWithURL(req.JobID, "done", uploadURL)
}

func generateScheduleC(transactions []Transaction) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "Letter", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "Schedule C (Form 1040)")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	pdf.Cell(40, 10, "Profit or Loss From Business")
	pdf.Ln(20)

	// Calculate category totals
	categoryTotals := make(map[string]float64)
	for _, t := range transactions {
		if t.Category != "" {
			categoryTotals[t.Category] += t.Amount
		}
	}

	// Part I - Income
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Part I - Income")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)
	
	totalIncome := 0.0
	pdf.Cell(40, 10, fmt.Sprintf("1. Gross receipts: $%.2f", totalIncome))
	pdf.Ln(15)

	// Part II - Expenses
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(40, 10, "Part II - Expenses")
	pdf.Ln(10)
	pdf.SetFont("Arial", "", 12)

	y := pdf.GetY()
	lineHeight := 7.0
	totalExpenses := 0.0

	for category, amount := range categoryTotals {
		pdf.Cell(120, lineHeight, formatCategory(category))
		pdf.CellFormat(40, lineHeight, fmt.Sprintf("$%.2f", amount), "", 0, "R", false, 0, "")
		pdf.Ln(lineHeight)
		totalExpenses += amount
	}

	pdf.Ln(10)
	pdf.SetFont("Arial", "B", 12)
	pdf.Cell(120, 10, "Total Expenses")
	pdf.CellFormat(40, 10, fmt.Sprintf("$%.2f", totalExpenses), "", 0, "R", false, 0, "")
	pdf.Ln(15)

	// Net Profit/Loss
	netProfit := totalIncome - totalExpenses
	pdf.SetFont("Arial", "B", 14)
	pdf.Cell(120, 10, "Net Profit (or Loss)")
	color := 0
	if netProfit < 0 {
		pdf.SetTextColor(255, 0, 0)
		color = 1
	}
	pdf.CellFormat(40, 10, fmt.Sprintf("$%.2f", netProfit), "", 0, "R", false, 0, "")
	if color == 1 {
		pdf.SetTextColor(0, 0, 0)
	}

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	return buf.Bytes(), err
}

func generate1099Forms(transactions []Transaction) ([]byte, error) {
	pdf := fpdf.New("P", "mm", "Letter", "")
	pdf.AddPage()
	pdf.SetFont("Arial", "B", 16)
	pdf.Cell(40, 10, "1099-MISC Forms Summary")
	pdf.Ln(20)

	// Group transactions by merchant
	merchantTotals := make(map[string]float64)
	for _, t := range transactions {
		merchantTotals[t.Merchant] += t.Amount
	}

	pdf.SetFont("Arial", "", 12)
	for merchant, total := range merchantTotals {
		if total >= 600 { // Only include if >= $600
			pdf.Cell(120, 10, merchant)
			pdf.CellFormat(40, 10, fmt.Sprintf("$%.2f", total), "", 0, "R", false, 0, "")
			pdf.Ln(10)
		}
	}

	var buf bytes.Buffer
	err := pdf.Output(&buf)
	return buf.Bytes(), err
}

func formatCategory(category string) string {
	switch category {
	case "meals":
		return "Meals and Entertainment"
	case "travel":
		return "Travel"
	case "software":
		return "Software and Subscriptions"
	case "home_office":
		return "Home Office"
	case "equipment":
		return "Equipment"
	case "supplies":
		return "Office Supplies"
	case "professional_services":
		return "Professional Services"
	case "advertising":
		return "Advertising and Marketing"
	default:
		return "Other Business Expenses"
	}
}

func uploadToStorage(data []byte, fileName string) (string, error) {
	// In a real implementation, upload to Supabase Storage or S3
	// For now, return a mock URL
	return fmt.Sprintf("%s/storage/v1/object/public/forms/%s", supabaseURL, fileName), nil
}

func updateJobStatus(jobID, status, errorMessage string) {
	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Printf("Failed to create Supabase client: %v", err)
		return
	}

	update := map[string]interface{}{
		"status":     status,
		"updated_at": time.Now(),
	}
	if errorMessage != "" {
		update["error_message"] = errorMessage
	}

	err = client.From("form_jobs").
		Update(update).
		Eq("id", jobID).
		Execute(nil)
	if err != nil {
		log.Printf("Failed to update job status: %v", err)
	}
}

func updateJobStatusWithURL(jobID, status, resultURL string) {
	client, err := supabase.NewClient(supabaseURL, supabaseKey, nil)
	if err != nil {
		log.Printf("Failed to create Supabase client: %v", err)
		return
	}

	update := map[string]interface{}{
		"status":     status,
		"result_url": resultURL,
		"updated_at": time.Now(),
	}

	err = client.From("form_jobs").
		Update(update).
		Eq("id", jobID).
		Execute(nil)
	if err != nil {
		log.Printf("Failed to update job status: %v", err)
	}
}