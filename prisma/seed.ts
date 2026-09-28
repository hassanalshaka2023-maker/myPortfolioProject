/**
 * Seeds the database with the content from the original portfolio.
 * Safe to re-run: settings/projects/admin are upserted, skills/services are only inserted when empty.
 * Values marked [TODO] are missing data — edit them from the dashboard.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { PrismaClient, type SkillCategory } from "../src/generated/prisma/client";

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) {
    console.warn("⚠  ADMIN_EMAIL / ADMIN_PASSWORD not set — skipping admin user.");
    return;
  }
  if (password.length < 12) throw new Error("ADMIN_PASSWORD must be at least 12 characters.");
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, name: "Hassan Alsheikha", passwordHash },
  });
  console.log(`✓ admin user: ${email}`);
}

async function seedSettings() {
  const data = {
    nameEn: "Hassan Alsheikha",
    nameAr: "حسان الشيخه",
    roleEn: "Full-Stack Developer",
    roleAr: "مطوّر Full-Stack",
    taglineEn: "I build *scalable* Full-Stack solutions.",
    taglineAr: "أبني حلولاً برمجية متكاملة *قابلة للتوسّع*.",
    introEn:
      "MERN Stack Developer and Software Engineering graduate from Damascus University. I specialize in designing robust database architectures, secure backend APIs, and efficient user experiences.",
    introAr:
      "مطوّر MERN Stack وخرّيج هندسة البرمجيات من جامعة دمشق. متخصص في تصميم قواعد بيانات متينة، وواجهات برمجية (APIs) آمنة، وتجارب مستخدم فعّالة.",
    aboutEn:
      "I'm a Software Engineering graduate from Damascus University who loves the backend side of things — data models, APIs, and the architecture that keeps products fast and secure as they grow.\n\n[TODO] Add a few lines about your journey, what you enjoy building, and what you're looking for next.",
    aboutAr:
      "خرّيج هندسة البرمجيات من جامعة دمشق، شغوف بالجانب الخلفي من التطبيقات — نماذج البيانات، والـ APIs، والبنية التي تحافظ على سرعة المنتج وأمانه مع نموّه.\n\n[TODO] أضف بضعة أسطر عن رحلتك وما تحب بناءه وما تبحث عنه لاحقاً.",
    locationEn: "Damascus, Syria",
    locationAr: "دمشق، سوريا",
    email: null, // [TODO] real contact email
    githubUrl: null, // [TODO]
    linkedinUrl: null, // [TODO]
    yearsOfExperience: 0, // [TODO] — the stat is hidden while this is 0
    openToWork: true,
    showServices: false,
  };
  await db.siteSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1, ...data } });
  console.log("✓ site settings");
}

async function seedProjects() {
  const projects = [
    {
      slug: "expoplan",
      titleEn: "ExpoPlan — Exhibition Management",
      titleAr: "ExpoPlan — منصّة إدارة المعارض",
      summaryEn:
        "An integrated monorepo platform for managing and organizing exhibitions, with a robust backend API architecture and a highly responsive interface.",
      summaryAr: "منصّة متكاملة (Monorepo) لإدارة وتنظيم المعارض، ببنية API خلفية متينة وواجهة مستخدم سريعة الاستجابة.",
      techStack: ["Node.js", "Express.js", "React", "MongoDB", "REST APIs"],
      category: "FULL_STACK" as const,
      featured: true,
      order: 0,
    },
    {
      slug: "idea-bookstore",
      titleEn: "IDEA Multi-Platform BookStore",
      titleAr: "IDEA — متجر كتب متعدد المنصّات",
      summaryEn:
        "A management system with a user portal for book borrowing and an admin dashboard with full CRUD for stock, sales, and analytics.",
      summaryAr: "نظام إدارة يضم بوابة للمستخدمين لاستعارة الكتب، ولوحة تحكم إدارية كاملة لإدارة المخزون والمبيعات والإحصائيات.",
      techStack: ["Node.js", "Express.js", "MongoDB", "TypeScript", "HTML", "CSS"],
      category: "FULL_STACK" as const,
      featured: true,
      order: 1,
    },
    {
      slug: "adea-platform",
      titleEn: "ADEA Web & Mobile Platform",
      titleAr: "ADEA — منصّة الويب والموبايل",
      summaryEn:
        "A unified, optimized backend architecture serving responsive web and mobile clients simultaneously, with secure data modeling.",
      summaryAr: "بنية خلفية موحّدة ومحسّنة تخدم تطبيقات الويب والموبايل في آنٍ واحد، مع نمذجة بيانات آمنة.",
      techStack: ["Node.js", "Express.js", "MongoDB", "REST APIs"],
      category: "BACKEND" as const,
      featured: true,
      order: 2,
    },
  ];

  for (const p of projects) {
    await db.project.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...p,
        status: "COMPLETED",
        published: true,
        contentEn: "[TODO] Describe the project in more detail: context, key features, challenges.",
        contentAr: "[TODO] اكتب وصفاً أكثر تفصيلاً للمشروع: السياق، الميزات الأساسية، والتحديات.",
      },
    });
  }
  console.log(`✓ ${projects.length} projects`);
}

async function seedSkills() {
  if ((await db.skill.count()) > 0) return console.log("• skills already present — skipped");
  const skills: { name: string; category: SkillCategory; icon: string | null }[] = [
    { name: "Node.js", category: "BACKEND", icon: "nodedotjs" },
    { name: "Express.js", category: "BACKEND", icon: "express" },
    { name: "NestJS", category: "BACKEND", icon: "nestjs" },
    { name: "Laravel", category: "BACKEND", icon: "laravel" },
    { name: "REST APIs", category: "BACKEND", icon: "openapiinitiative" },
    { name: "React", category: "FRONTEND", icon: "react" },
    { name: "TypeScript", category: "FRONTEND", icon: "typescript" },
    { name: "JavaScript", category: "FRONTEND", icon: "javascript" },
    { name: "HTML", category: "FRONTEND", icon: "html5" },
    { name: "CSS", category: "FRONTEND", icon: "css" },
    { name: "MongoDB", category: "DATABASES", icon: "mongodb" },
    { name: "MySQL", category: "DATABASES", icon: "mysql" },
    { name: "SQL", category: "DATABASES", icon: null },
    { name: "Git", category: "TOOLS", icon: "git" },
    { name: "GitHub", category: "TOOLS", icon: "github" },
  ];
  await db.skill.createMany({ data: skills.map((s, order) => ({ ...s, order })) });
  console.log(`✓ ${skills.length} skills`);
}

async function seedServices() {
  if ((await db.service.count()) > 0) return console.log("• services already present — skipped");
  await db.service.createMany({
    data: [
      {
        titleEn: "Backend & API Development",
        titleAr: "تطوير الواجهات الخلفية والـ APIs",
        descriptionEn: "Secure, well-documented REST APIs with Node.js, Express and NestJS.",
        descriptionAr: "واجهات REST آمنة وموثّقة باستخدام Node.js وExpress وNestJS.",
        icon: "server",
        order: 0,
      },
      {
        titleEn: "Full-Stack Web Apps",
        titleAr: "تطبيقات ويب متكاملة",
        descriptionEn: "End-to-end products with React on the front and a scalable backend behind it.",
        descriptionAr: "منتجات متكاملة من الواجهة بـ React إلى خلفية قابلة للتوسّع.",
        icon: "layout-dashboard",
        order: 1,
      },
      {
        titleEn: "Database Design",
        titleAr: "تصميم قواعد البيانات",
        descriptionEn: "Data models for MongoDB and SQL databases that stay fast as data grows.",
        descriptionAr: "نماذج بيانات لقواعد MongoDB وSQL تبقى سريعة مع نمو البيانات.",
        icon: "database",
        order: 2,
      },
    ],
  });
  console.log("✓ services (hidden by default — enable from the dashboard)");
}

async function ensureBucket() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "portfolio";
  if (!url || !key) return console.warn("⚠  Supabase storage env not set — skipping bucket check.");
  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data } = await supabase.storage.getBucket(bucket);
  if (data) return console.log(`• storage bucket "${bucket}" exists`);
  const { error } = await supabase.storage.createBucket(bucket, { public: true, fileSizeLimit: "8MB" });
  if (error) throw error;
  console.log(`✓ storage bucket "${bucket}" created`);
}

async function main() {
  await seedAdmin();
  await seedSettings();
  await seedProjects();
  await seedSkills();
  await seedServices();
  await ensureBucket();
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
