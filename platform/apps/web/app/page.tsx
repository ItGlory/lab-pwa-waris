export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-water-light to-white">
      <div className="container mx-auto px-4 py-16">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-bold text-water-dark mb-4">
            WARIS
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            ระบบวิเคราะห์และรายงานข้อมูลน้ำสูญเสียอัจฉริยะ
          </p>
          <p className="text-lg text-gray-500">
            Water Loss Intelligent Analysis and Reporting System
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <DashboardCard
            title="แดชบอร์ด"
            titleEn="Dashboard"
            description="ภาพรวมข้อมูลน้ำสูญเสีย"
            icon="📊"
            href="/dashboard"
          />
          <DashboardCard
            title="วิเคราะห์ DMA"
            titleEn="DMA Analysis"
            description="วิเคราะห์พื้นที่จ่ายน้ำย่อย"
            icon="🔍"
            href="/analysis"
          />
          <DashboardCard
            title="รายงาน"
            titleEn="Reports"
            description="สร้างรายงานอัตโนมัติ"
            icon="📄"
            href="/reports"
          />
          <DashboardCard
            title="ถาม-ตอบ AI"
            titleEn="AI Q&A"
            description="ระบบถามตอบอัจฉริยะ"
            icon="🤖"
            href="/chat"
          />
        </div>

        <footer className="text-center text-gray-500 text-sm">
          <p>การประปาส่วนภูมิภาค (กปภ.) - Provincial Waterworks Authority</p>
          <p className="mt-2">Powered by AI Technology</p>
        </footer>
      </div>
    </main>
  );
}

function DashboardCard({
  title,
  titleEn,
  description,
  icon,
  href,
}: {
  title: string;
  titleEn: string;
  description: string;
  icon: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="dashboard-widget block hover:scale-105 transition-transform"
    >
      <div className="text-4xl mb-4">{icon}</div>
      <h2 className="text-xl font-semibold text-gray-900 mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-2">{titleEn}</p>
      <p className="text-gray-600">{description}</p>
    </a>
  );
}
