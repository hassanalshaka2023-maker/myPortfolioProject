// بيانات المشاريع والمهارات الخاصة بك للتعديل عليها بسهولة
const skills = ['MongoDB','sql','mysql', 'Express.js','nest.js', 'React.js', 'Node.js', 'TypeScript', 'JavaScript (ES6+)', 'REST APIs','html','css','laravel', 'Git & GitHub'];

const projects = [
  {
    title: 'ExpoPlan - Exhibition Management',
    description: 'An integrated Monorepo platform designed for managing and organizing exhibitions. Features a robust backend API architectural structure along with a highly responsive user interface.',
    tags: ['Node.js', 'Express.js', 'React.js', 'MongoDB', 'REST APIs'],
    github: 'https://github.com',
    live: '#' // ضع هنا رابط الاستضافة الحية لاحقاً إذا قمت بنشره
  },
  {
    title: 'IDEA Multi-Platform BookStore',
    description: 'A comprehensive management system featuring a user portal for book borrowing and an advanced Admin Dashboard with full CRUD operations for stock, sales, and analytics.',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'TypeScript', 'HTML/CSS'],
    github: '#', // ضع رابط الجيت هب الخاص بهذا المشروع هنا إن وجد
    live: '#'
  },
  {
    title: 'ADEA Web & Mobile Platform',
    description: 'Engineered a unified, highly optimized backend architecture serving both responsive web applications and mobile clients simultaneously with secure data modeling.',
    tags: ['Node.js', 'Express.js', 'MongoDB', 'REST APIs'],
    github: '#', // ضع رابط الجيت هب الخاص بهذا المشروع هنا إن وجد
    live: '#'
  }
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans selection:bg-teal-500 selection:text-slate-900">
      
      {/* 1. الهيدر وقمة الصفحة (Hero Section) */}
      <header className="max-w-5xl mx-auto px-6 pt-24 pb-16 flex flex-col justify-center min-h-[70vh]">
        <p className="text-teal-400 font-mono text-sm mb-3 tracking-wider">// Hi, my name is</p>
        <h1 className="text-5xl md:text-7xl font-bold text-slate-50 tracking-tight mb-4">
          Hassan Alsheikha.
        </h1>
        <h2 className="text-4xl md:text-6xl font-bold text-slate-400 tracking-tight mb-6">
          I build scalable Full-Stack solutions.
        </h2>
        <p className="text-slate-400 max-w-xl text-lg leading-relaxed mb-8">
          I am a <strong className="text-slate-200">MERN Stack Developer</strong> and Software Engineering graduate from Damascus University. I specialize in designing robust database architectures, secure backend APIs, and efficient user experiences.
        </p>
        <div>
          <a href="#projects" className="inline-block border border-teal-400 text-teal-400 px-6 py-3 rounded hover:bg-teal-400/10 transition duration-300 font-mono text-sm">
            Check out my work!
          </a>
        </div>
      </header>

      {/* 2. قسم المهارات التقنية (Skills Section) */}
      <section id="skills" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800">
        <h3 className="text-2xl font-bold text-slate-200 flex items-center gap-2 mb-8">
          <span className="text-teal-400 font-mono text-lg">01.</span> Tech Stack
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {skills.map((skill, index) => (
            <div key={index} className="bg-slate-800/50 border border-slate-700/50 p-4 rounded hover:border-teal-400/50 transition duration-300 group">
              <p className="font-mono text-sm text-slate-400 group-hover:text-teal-400 transition">{skill}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. قسم المشاريع (Projects Section) */}
      <section id="projects" className="max-w-5xl mx-auto px-6 py-16 border-t border-slate-800">
        <h3 className="text-2xl font-bold text-slate-200 flex items-center gap-2 mb-12">
          <span className="text-teal-400 font-mono text-lg">02.</span> Featured Projects
        </h3>
        <div className="grid md:grid-cols-2 gap-8">
          {projects.map((project, index) => (
            <div key={index} className="bg-slate-800 border border-slate-700 p-6 rounded-lg flex flex-col justify-between hover:-translate-y-2 transition duration-300 shadow-xl">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-teal-400 text-2xl">📁</span>
                  <div className="flex gap-3 text-slate-400 text-sm font-mono">
                    <a href={project.github} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">Code</a>
                    {project.live !== '#' && (
                      <a href={project.live} target="_blank" rel="noopener noreferrer" className="hover:text-teal-400 transition">Live</a>
                    )}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-slate-100 mb-3 group-hover:text-teal-400">
                  {project.title}
                </h4>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">
                  {project.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tags.map((tag, tIndex) => (
                  <span key={tIndex} className="bg-slate-900 text-teal-400/80 font-mono text-xs px-2.5 py-1 rounded border border-teal-500/10">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. قسم التواصل (Contact Section) */}
      <section id="contact" className="max-w-5xl mx-auto px-6 py-24 border-t border-slate-800 text-center">
        <span className="text-teal-400 font-mono text-sm block mb-3">03. What's Next?</span>
        <h3 className="text-4xl font-bold text-slate-200 mb-4">Get In Touch</h3>
        <p className="text-slate-400 max-w-md mx-auto mb-8 text-sm leading-relaxed">
          I'm currently looking for new opportunities as a MERN Stack Developer. Whether you have a question or just want to say hi, my inbox is always open!
        </p>
        <a href="mailto:your.email@example.com" className="inline-block border-2 border-teal-400 text-teal-400 px-8 py-3.5 rounded font-mono text-sm hover:bg-teal-400/10 transition duration-300">
          Say Hello
        </a>
      </section>

      {/* الفوتر */}
      <footer className="text-center py-8 border-t border-slate-800/50 text-slate-500 font-mono text-xs">
        <p>Designed & Built by Hassan Alsheikha © 2026</p>
      </footer>

    </div>
  );
}
