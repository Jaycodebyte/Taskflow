import {
  CheckSquare,
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 bg-[#357AFF] rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
            <CheckSquare className="text-white h-6 w-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-gray-900">
            TaskFlow
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#features"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Features
          </a>
          <a
            href="#about"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            About
          </a>
          <a
            href="/account/signin"
            className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
          >
            Login
          </a>
          <a
            href="/account/signup"
            className="bg-[#357AFF] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#2E69DE] transition-all shadow-lg shadow-blue-200 active:scale-95"
          >
            Sign Up
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-[#357AFF] text-sm font-bold mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#357AFF]"></span>
              </span>
              Now trusted by over 10,000+ teams
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-gray-900 leading-[1.1] mb-8">
              Manage Tasks <br />
              <span className="text-[#357AFF]">Without The Mess.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed">
              TaskFlow is the simplest way for modern teams to collaborate,
              track projects, and hit deadlines. Minimalist design, maximalist
              results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/account/signup"
                className="bg-[#357AFF] text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-[#2E69DE] transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2 group"
              >
                Sign Up
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </a>
              <a
                href="/account/signin"
                className="bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-gray-50 transition-all flex items-center justify-center"
              >
                Login
              </a>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500 to-indigo-500 rounded-[2rem] blur-2xl opacity-10 animate-pulse"></div>
            <div className="relative bg-white rounded-3xl border border-gray-100 shadow-2xl p-4 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1540350394557-8d14678e7f91?auto=format&fit=crop&q=80&w=2000"
                alt="App Screenshot"
                className="rounded-2xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Built for high-performance teams
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Everything you need to keep your projects on track and your team
              synchronized.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "No bloat. Just the features you need to get things done quickly.",
              },
              {
                icon: Shield,
                title: "Secure by Design",
                desc: "Your data is protected with industry-standard security protocols.",
              },
              {
                icon: Users,
                title: "Team Focused",
                desc: "Built from the ground up for collaboration and member management.",
              },
              {
                icon: BarChart3,
                title: "Real-time Analytics",
                desc: "Visual dashboard to track progress and identify bottlenecks.",
              },
              {
                icon: CheckSquare,
                title: "Kanban Boards",
                desc: "Organize your workflow visually with drag-and-drop simplicity.",
              },
              {
                icon: ArrowRight,
                title: "Scaleable",
                desc: "Grows with your team from 2 to 200 members effortlessly.",
              },
            ].map((f, i) => (
              <div
                key={i}
                className="bg-white p-8 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group"
              >
                <div className="h-14 w-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <f.icon className="h-7 w-7 text-[#357AFF]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-8 w-8 bg-[#357AFF] rounded-lg flex items-center justify-center">
              <CheckSquare className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">TaskFlow</span>
          </div>
          <p className="text-gray-500">
            © 2026 TaskFlow Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
