import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export const maxDuration = 60;

interface PDFRequestData {
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

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as PDFRequestData;
    const {
      pondSize,
      fishCount,
      expectedGrowth,
      marketPricePerKg,
      totalFishWeight,
      totalFeedNeeded,
      totalFeedCost,
      otherCosts,
      totalCost,
      netProfit,
      roi,
    } = body;

    const currentFormattedDate = new Date().toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const htmlTemplate = `
      <!DOCTYPE html>
      <html lang="bn">
      <head>
        <meta charset="UTF-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: ui-sans-serif, system-ui, -apple-system, sans-serif; }
          body { background-color: #f8fafc; color: #0f2d35; padding: 40px; min-height: 100vh; display: flex; flex-col; justify-content: space-between; }
          .container { width: 100%; max-width: 800px; margin: 0 auto; background: #ffffff; padding: 32px; rounded-radius: 24px; border: 1px solid #e2f0ed; box-shadow: 0 4px 30px rgba(0, 0, 0, 0.02); }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e2f0ed; padding-bottom: 20px; margin-bottom: 24px; }
          .brand-title { font-size: 26px; font-weight: 900; color: #0f6a6b; letter-spacing: -0.5px; }
          .brand-sub { font-size: 12px; font-weight: 700; color: #10b981; text-transform: uppercase; margin-top: 2px; }
          .report-meta { text-align: right; font-size: 12px; font-weight: 600; color: #64748b; }
          .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px; }
          .section-title { font-size: 14px; font-weight: 900; color: #0f6a6b; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px; }
          .data-card { background: #f4faf8; border: 1px solid #e2f0ed; padding: 12px 16px; border-radius: 14px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
          .data-label { font-size: 13px; font-weight: 700; color: #475569; }
          .data-value { font-size: 14px; font-weight: 900; color: #0f2d35; }
          .summary-panel { background: linear-gradient(135deg, #042f35 0%, #0a5c66 100%); color: #ffffff; padding: 24px; border-radius: 18px; margin-top: 8px; }
          .summary-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.08); }
          .summary-row:last-child { border-bottom: none; padding-bottom: 0; }
          .summary-row:first-child { padding-top: 0; }
          .summary-label { font-size: 14px; font-weight: 700; color: rgba(255, 255, 255, 0.7); }
          .summary-value { font-size: 16px; font-weight: 900; }
          .net-profit-box { display: flex; justify-content: space-between; align-items: center; background: rgba(255, 255, 255, 0.05); padding: 14px 18px; border-radius: 12px; margin: 12px 0; border: 1px solid rgba(255, 255, 255, 0.1); }
          .value-prime { font-size: 22px; font-weight: 900; color: #34d399; }
          .value-loss { font-size: 22px; font-weight: 900; color: #f87171; }
          .footer { text-align: center; font-size: 11px; font-weight: 700; color: #94a3b8; border-top: 1px solid #e2f0ed; padding-top: 16px; margin-top: 32px; }
        </style>
      </head>
      <body>
        <div class="container">
          <header class="header">
            <div>
              <h1 class="brand-title">মৎস্য বন্ধু</h1>
              <p class="brand-sub">স্মার্ট একুয়াকালচার নেটওয়ার্ক</p>
            </div>
            <div class="report-meta">
              <p style="font-weight: 800; color: #334155;">বিনিয়োগ ও লাভ-ক্ষতি প্রতিবেদন</p>
              <p style="margin-top: 2px;">তারিখ: ${currentFormattedDate}</p>
            </div>
          </header>

          <div class="grid-container">
            <div>
              <h2 class="section-title">পুকুর ও উৎপাদন ইনপুট</h2>
              <div class="data-card"><span class="data-label">পুকুরের আকার</span><span class="data-value">${pondSize} শতাংশ</span></div>
              <div class="data-card"><span class="data-label">স্টকিং মাছের সংখ্যা</span><span class="data-value">${fishCount.toLocaleString("bn-BD")} টি</span></div>
              <div class="data-card"><span class="data-label">প্রত্যাশিত গড় ওজন</span><span class="data-value">${expectedGrowth.toLocaleString("bn-BD")} গ্রাম</span></div>
              <div class="data-card"><span class="data-label">পাইকারি বাজার দর</span><span class="data-value">${marketPricePerKg.toLocaleString("bn-BD")} ৳/কেজি</span></div>
            </div>
            
            <div>
              <h2 class="section-title">অপারেটিং ব্যয়ের ব্রেকডাউন</h2>
              <div class="data-card"><span class="data-label">মোট বায়োমাস উৎপাদন</span><span class="data-value">${totalFishWeight.toLocaleString("bn-BD")} কেজি</span></div>
              <div class="data-card"><span class="data-label">মোট প্রয়োজনীয় খাদ্য</span><span class="data-value">${totalFeedNeeded.toLocaleString("bn-BD")} কেজি</span></div>
              <div class="data-card"><span class="data-label">খাদ্য সংগ্রহ বাবদ ব্যয়</span><span class="data-value">${totalFeedCost.toLocaleString("bn-BD")} ৳</span></div>
              <div class="data-card"><span class="data-label">লীজ ও অন্যান্য আনুষঙ্গিক</span><span class="data-value">${otherCosts.toLocaleString("bn-BD")} ৳</span></div>
            </div>
          </div>

          <div class="summary-panel">
            <div class="summary-row">
              <span class="summary-label">মোট প্রজেক্টেড রাজস্ব (গ্রস আয়)</span>
              <span class="summary-value" style="color: #34d399;">+ ${body.totalRevenue.toLocaleString("bn-BD")} ৳</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">সর্বমোট উৎপাদন বিনিয়োগ (ব্যয়)</span>
              <span class="summary-value" style="color: #f87171;">- ${totalCost.toLocaleString("bn-BD")} ৳</span>
            </div>
            
            <div class="net-profit-box">
              <span class="summary-label" style="color: #ffffff; font-size: 15px; font-weight: 800;">পরিকল্পিত নিট মুনাফা (লাভ)</span>
              <span class="${netProfit >= 0 ? "value-prime" : "value-loss"}">${netProfit.toLocaleString("bn-BD")} ৳</span>
            </div>

            <div class="summary-row">
              <span class="summary-label">বিনিয়োগের বিপরীতে রিটার্ন হার (ROI)</span>
              <span class="summary-value" style="color: ${roi >= 0 ? "#34d399" : "#f87171"}; font-size: 18px;">${roi.toFixed(1)}%</span>
            </div>
          </div>

          <footer class="footer">
            <p>এই ডাটা-শীটটি মৎস্য বন্ধু কোর ফাইন্যান্সিয়াল অ্যালগরিদম দ্বারা স্বয়ংক্রিয়ভাবে জেনারেট করা হয়েছে।</p>
            <p>© ${new Date().getFullYear()} MatshoBondhu Ecosystem. All Rights Reserved. (Strictly 1-Page Layout)</p>
          </footer>
        </div>
      </body>
      </html>
    `;

    const getExecutablePath = (): string | undefined => {
      const platform = process.platform;
      if (platform === "linux") {
        return (
          process.env.PUPPETEER_EXECUTABLE_PATH ||
          process.env.CHROME_EXECUTABLE_PATH ||
          "/usr/bin/chromium-browser" ||
          "/usr/bin/google-chrome-stable"
        );
      }
      if (platform === "win32") {
        return process.env.PUPPETEER_EXECUTABLE_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
      }
      if (platform === "darwin") {
        return process.env.PUPPETEER_EXECUTABLE_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
      }
      return process.env.PUPPETEER_EXECUTABLE_PATH;
    };

    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"],
      executablePath: getExecutablePath(),
      headless: true,
    });

    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "domcontentloaded" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
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
    const msg = error instanceof Error ? error.message : "Failed to emit PDF";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}