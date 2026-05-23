import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json();
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

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>মৎস্য বন্ধু - লাভ-ক্ষতি ও বিনিয়োগ রিপোর্ট</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Noto Sans Bengali', sans-serif;
            background-color: #ffffff;
            color: #1a1a1a;
            padding: 20px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding: 30px;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            border-radius: 12px;
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
          .header .date {
            font-size: 12px;
            margin-top: 8px;
          }
          .section {
            margin-bottom: 25px;
          }
          .section h2 {
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
          .card {
            background: #f9fafb;
            padding: 12px;
            border-radius: 8px;
            border-left: 4px solid #10b981;
          }
          .card .label {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 4px;
          }
          .card .value {
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
          .summary-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid rgba(16, 185, 129, 0.19);
          }
          .summary-row:last-child {
            border-bottom: none;
          }
          .summary-row .label {
            font-size: 14px;
            font-weight: 600;
            color: #374151;
          }
          .summary-row .value {
            font-size: 18px;
            font-weight: 700;
          }
          .value.positive {
            color: #10b981;
          }
          .value.negative {
            color: #ef4444;
          }
          .footer {
            text-align: center;
            padding: 20px;
            background: #f9fafb;
            margin-top: 25px;
            font-size: 12px;
            color: #6b7280;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>মৎস্য বন্ধু</h1>
          <p>লাভ-ক্ষতি ও বিনিয়োগ রিপোর্ট</p>
          <p class="date">${new Date().toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        
        <div class="section">
          <h2>ইনপুট তথ্য</h2>
          <div class="grid">
            <div class="card">
              <div class="label">পুকুরের আকার</div>
              <div class="value">${pondSize} শতাংশ</div>
            </div>
            <div class="card">
              <div class="label">মাছের সংখ্যা</div>
              <div class="value">${Number(fishCount).toLocaleString('bn-BD')} টি</div>
            </div>
            <div class="card">
              <div class="label">খাবারের দাম (প্রতি কেজি)</div>
              <div class="value">${Number(feedCostPerKg).toLocaleString('bn-BD')} টাকা</div>
            </div>
            <div class="card">
              <div class="label">প্রত্যাশিত ওজন (প্রতি মাছ)</div>
              <div class="value">${Number(expectedGrowth).toLocaleString('bn-BD')} গ্রাম</div>
            </div>
            <div class="card">
              <div class="label">বাজার দাম (প্রতি কেজি)</div>
              <div class="value">${Number(marketPricePerKg).toLocaleString('bn-BD')} টাকা</div>
            </div>
          </div>
        </div>
        
        <div class="section">
          <h2>গণনা বিবরণ</h2>
          <div class="grid">
            <div class="card">
              <div class="label">মোট মাছের ওজন</div>
              <div class="value">${Number(totalFishWeight).toFixed(2)} কেজি</div>
            </div>
            <div class="card">
              <div class="label">মোট খাবার প্রয়োজন</div>
              <div class="value">${Number(totalFeedNeeded).toFixed(2)} কেজি</div>
            </div>
            <div class="card">
              <div class="label">মোট খাবার খরচ</div>
              <div class="value">${Number(totalFeedCost).toLocaleString('bn-BD')} টাকা</div>
            </div>
            <div class="card">
              <div class="label">অন্যান্য খরচ</div>
              <div class="value">${Number(otherCosts).toLocaleString('bn-BD')} টাকা</div>
            </div>
          </div>
        </div>
        
        <div class="summary">
          <div class="summary-row">
            <span class="label">মোট আয়</span>
            <span class="value positive">${Number(totalRevenue).toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div class="summary-row">
            <span class="label">মোট খরচ</span>
            <span class="value negative">${Number(totalCost).toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div class="summary-row">
            <span class="label">নিট লাভ/ক্ষতি</span>
            <span class="value ${Number(netProfit) >= 0 ? 'positive' : 'negative'}">${Number(netProfit).toLocaleString('bn-BD')} টাকা</span>
          </div>
          <div class="summary-row">
            <span class="label">ROI (বিনিয়োগের হার)</span>
            <span class="value ${Number(roi) >= 0 ? 'positive' : 'negative'}">${Number(roi).toFixed(1)}%</span>
          </div>
        </div>
        
        <div class="footer">
          <p>এই রিপোর্টটি মৎস্য বন্ধু প্ল্যাটফর্ম থেকে জেনারেট করা হয়েছে</p>
          <p>© ${new Date().getFullYear()} মৎস্য বন্ধু - সর্বস্বত্ব সংরক্ষিত</p>
        </div>
      </body>
      </html>
    `;

    const isLocalWindows = process.platform === "win32";

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      executablePath: isLocalWindows 
        ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
        : process.env.PUPPETEER_EXECUTABLE_PATH || "/usr/bin/chromium-browser",
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "domcontentloaded" });
    
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "15mm", right: "15mm", bottom: "15mm", left: "15mm" }
    });

    await browser.close();

    return new NextResponse(Buffer.from(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="Fish_Profit_Report.pdf"',
      },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Failed to generate PDF";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
