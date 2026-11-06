import React from 'react';
import { ShieldCheck, Heart, Users, Code, Award, CheckCircle2, FileText, Database } from 'lucide-react';
import { MedicalDisclaimer } from '../components/MedicalDisclaimer.js';

interface AboutPageProps {
  onNavigate: (page: string) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigate }) => {
  const teamMembers = [
    {
      name: 'Alex Rivera',
      role: 'Lead Full-Stack Architect',
      focus: 'Express.js REST APIs, Vite Integration & State Coordination',
      degree: 'B.Tech / B.Sc Computer Science Engineering',
    },
    {
      name: 'Samira Chen',
      role: 'Database & Algorithm Engineer',
      focus: 'MongoDB Schema, Smart RBC Compatibility & Cooldown Calculation',
      degree: 'B.Tech Information Technology',
    },
    {
      name: 'Marcus Brody',
      role: 'Frontend UI/UX & Security Lead',
      focus: 'React Interface, Tailwind CSS, JWT Auth & QR Verification Card',
      degree: 'B.Tech Software Systems',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="max-w-3xl space-y-3">
        <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">
          About BloodConnect
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Fast, Transparent Blood Donor Coordination
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          BloodConnect was developed as an advanced Online Blood Donor Management System to address the critical time delays patients face when locating voluntary blood donors during surgical emergencies.
        </p>
      </div>

      {/* Lab Image & Mission Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-slate-200 shadow-md">
          <img
            src="/src/assets/images/about_blood_lab_1793859486544.jpg"
            alt="Biomedical scientists performing haematology crossmatch tests in laboratory"
            className="w-full h-80 sm:h-96 object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="lg:col-span-5 space-y-5">
          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-600" />
              Our Core Mission
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To eliminate communication bottlenecks between hospital blood banks, voluntary donors, and anxious families by providing a verified, geolocated donor discovery system.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Privacy & Consent by Design
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Donor contact numbers are masked by default and require deliberate requester confirmation before revelation, protecting our volunteers from unsolicited spam.
            </p>
          </div>

          <div className="p-5 bg-white rounded-xl border border-slate-200 space-y-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-blue-600" />
              Donor Recognition & QR Badges
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every verified donor receives an authentic digital QR credential that can be presented at partnering clinics to authenticate donation logs.
            </p>
          </div>
        </div>
      </div>

      {/* Three-Member College Project Team Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Academic Project Overview
          </span>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight mt-1">
            Developed for 3-Member Final Year Project Training
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            This application demonstrates complete MERN stack engineering with role-based access control, secure cryptography, and responsive frontend architecture.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {teamMembers.map((member) => (
            <div key={member.name} className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-700 font-bold flex items-center justify-center text-sm mb-3">
                {member.name.split(' ').map(n => n[0]).join('')}
              </div>
              <h3 className="text-sm font-bold text-slate-900">{member.name}</h3>
              <p className="text-xs font-semibold text-red-600">{member.role}</p>
              <p className="text-xs text-slate-600 leading-relaxed">{member.focus}</p>
              <span className="text-[11px] text-slate-400 block pt-1 border-t border-slate-200 mt-2">
                {member.degree}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* Technology Stack Grid */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Technology Architecture (MERN Stack)
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-red-600 block">Frontend</span>
            <h4 className="text-sm font-bold text-slate-900">React.js & Tailwind</h4>
            <p className="text-xs text-slate-500">Fast responsive SPA, motion animations, and Lucide icons.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-red-600 block">Backend</span>
            <h4 className="text-sm font-bold text-slate-900">Node.js & Express</h4>
            <p className="text-xs text-slate-500">Modular REST API routes, controllers, and middleware.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-red-600 block">Database</span>
            <h4 className="text-sm font-bold text-slate-900">MongoDB & Mongoose</h4>
            <p className="text-xs text-slate-500">Normalized document schemas with auto-fallback persistent store.</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
            <span className="text-xs font-bold text-red-600 block">Security</span>
            <h4 className="text-sm font-bold text-slate-900">JWT & bcrypt</h4>
            <p className="text-xs text-slate-500">Salted password hashing and signed Bearer token authorization.</p>
          </div>
        </div>
      </section>

      {/* Safety Compliance notice */}
      <MedicalDisclaimer />
    </div>
  );
};
