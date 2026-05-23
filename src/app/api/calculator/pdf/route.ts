import { NextRequest, NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface CalculatorState {
  pondSize: number;
  fishCount: number;
  feedCostPerKg: number;
  expectedGrowth: number;
  marketPricePerKg: number;
  totalFishWeight: number;
  totalRevenue: number;
  totalFeedNeeded: number;
  totalFeedCost: number;
  otherCosts: number;
  totalCost: number;
  netProfit: number;
  roi: number;
}

export async function POST(req: NextRequest) {
  try {
    const body: CalculatorState = await req.json();

    // Validate required fields
    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    const {
      pondSize,
      fishCount,
      feedCostPerKg,
      expectedGrowth,
      marketPricePerKg,
      totalFishWeight,
      totalRevenue,
      totalFeedNeeded,
      totalFeedCost,
      otherCosts,
      totalCost,
      netProfit,
      roi,
    } = body;

    // Generate HTML template with inline CSS for PDF
    const html = `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>মৎস্য বন্ধু - লাভ-ক্ষতি ও বিনিয়োগ রিপোর্ট</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap');
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: 'Noto Sans Bengali', sans-serif;
      background: #f5f5f5;
      padding: 20px;
      color: #1a1a1a;
    }
    
    .container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .header {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      padding: 30px;
      text-align: center;
    }
    
    .header h1 {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }
    
    .header p {
      font-size: 14px;
      opacity: 0.9;
    }
    
    .content {
      padding: 30px;
    }
    
    .section {
      margin-bottom: 25px;
    }
    
    .section-title {
      font-size: 18px;
      font-weight: 700;
      color: #059669;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-bottom: 2px solid #10b981;
    }
    
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    
    .item {
      background: #f9fafb;
      padding: 12px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    
    .item-label {
      font-size: 13px;
      color: #6b7280;
      margin-bottom: 4px;
    }
    
    .item-value {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
    }
    
    .summary {
      background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
      padding: 20px;
      border-radius: 8px;
      margin-top: 25px;
    }
    
    .summary-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #10b98130;
    }
    
    .summary-item:last-child {
      border-bottom: none;
    }
    
    .summary-label {
      font-size: 14px;
      font-weight: 600;
      color: #374151;
    }
    
    .summary-value {
      font-size: 18px;
      font-weight: 700;
    }
    
    .profit {
      color: #10b981;
    }
    
    .loss {
      color: #ef4444;
    }
    
    .footer {
      text-align: center;
      padding: 20px;
      background: #f9fafb;
      font-size: 12px;
      color: #6b7280;
    }
    
    @media print {
      body {
        background: white;
        padding: 0;
      }
      
      .container {
        box-shadow: none;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>মৎস্য বন্ধু</h1>
      <p>লাভ-ক্ষতি ও বিনিয়োগ রিপোর্ট</p>
      <p style="font-size: 12px; margin-top: 8px;">${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
    </div>
    
    <div class="content">
      <div class="section">
        <div class="section-title">ইনপুট তথ্য</div>
        <div class="grid">
          <div class="item">
            <div class="item-label">পুকুরের আকার</div>
            <div class="item-value">${pondSize} শতাংশ</div>
          </div>
          <div class="item">
            <div class="item-label">মাছের সংখ্যা</div>
            <div class="item-value">${fishCount.toLocaleString('bn-BD')} টি</div>
          </div>
          <div class="item">
            <div class="item-label">খাবারের দাম (প্রতি কেজি)</div>
            <div class="item-value">${feedCostPerKg.toLocaleString('bn-BD')} টাকা</div>
          </div>
          <div class="item">
            <div class="item-label">প্রত্যাশিত ওজন (প্রতি মাছ)</div>
            <div class="item-value">${expectedGrowth.toLocaleString('bn-BD')} গ্রাম</div>
          </div>
          <div class="item">
            <div class="item-label">বাজার দাম (প্রতি কেজি)</div>
            <div class="item-value">${marketPricePerKg.toLocaleString('bn-BD')} টাকা</div>
          </div>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">গণনা বিবরণ</div>
        <div class="grid">
          <div class="item">
            <div class="item-label">মোট মাছের ওজন</div>
            <div class="item-value">${totalFishWeight.toFixed(2)} কেজি</div>
          </div>
          <div class="item">
            <div class="item-label">মোট খাবার প্রয়োজন</div>
            <div class="item-value">${totalFeedNeeded.toFixed(2)} কেজি</div>
          </div>
          <div class="item">
            <div class="item-label">মোট খাবার খরচ</div>
            <div class="item-value">${totalFeedCost.toLocaleString('bn-BD')} টাকা</div>
          </div>
          <div class="item">
            <div class="item-label">অন্যান্য খরচ</div>
            <div class="item-value">${otherCosts.toLocaleString('bn-BD')} টাকা</div>
          </div>
        </div>
      </div>
      
      <div class="summary">
        <div class="summary-item">
          <span class="summary-label">মোট আয়</span>
          <span class="summary-value profit">${totalRevenue.toLocaleString('bn-BD')} টাকা</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">মোট খরচ</span>
          <span class="summary-value loss">${totalCost.toLocaleString('bn-BD')} টাকা</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">নিট লাভ/ক্ষতি</span>
          <span class="summary-value ${netProfit >= 0 ? 'profit' : 'loss'}">${netProfit.toLocaleString('bn-BD')} টাকা</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">ROI (বিনিয়োগের হার)</span>
          <span class="summary-value ${roi >= 0 ? 'profit' : 'loss'}">${roi.toFixed(1)}%</span>
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p>এই রিপোর্টটি মৎস্য বন্ধু প্ল্যাটফর্ম থেকে জেনারেট করা হয়েছে</p>
      <p>© ${new Date().getFullYear()} মৎস্য বন্ধু - সর্বস্বত্ব সংরক্ষিত</p>
    </div>
  </div>
</body>
</html>
    `;

    // Use Puppeteer for PDF generation with Bengali font support
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20px', right: '20px', bottom: '20px', left: '20px' }
    });
    await browser.close();
    
    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Fish_Profit_Report.pdf"'
      }
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF report" },
      { status: 500 }
    );
  }
}
