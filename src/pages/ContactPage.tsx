import React, { useState } from 'react';
import { Phone, Mail, MapPin, Clock, MessageSquare, CheckCircle2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setTimeout(() => setSubmitted(false), 5000);
  };

  const faqs = [
    {
      q: 'Who is eligible to donate whole blood through BloodConnect?',
      a: 'Donors must generally be between 18 and 65 years old, weigh at least 50 kg (110 lbs), be in good general health, and not have donated whole blood within the last 56 days. Qualified medical technicians at the hospital independently screen each donor before collection.',
    },
    {
      q: 'Is donor contact information public?',
      a: 'No. To prevent spam and harassment, donor phone numbers and personal emails are protected behind a consent agreement. Requesters must confirm an active medical requirement before contact details can be revealed.',
    },
    {
      q: 'Does BloodConnect perform clinical blood tests or crossmatching?',
      a: 'No. BloodConnect is an information discovery and request coordination platform. All laboratory blood typing, Rh antibody screening, crossmatching, and pathogen testing must be performed by certified hospital hematology labs.',
    },
    {
      q: 'What should I do in an immediate life-threatening emergency?',
      a: 'Call national emergency services (911) or your local hospital emergency room immediately. Then post a request marked "Emergency" on BloodConnect to alert nearby compatible registered donors.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Title */}
      <div className="max-w-3xl space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-red-600">
          Emergency Support & Inquiry
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact the BloodConnect Coordination Desk
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          Need assistance with emergency donor dispatch, hospital onboarding, or technical verification? Our coordination team is ready 24/7.
        </p>
      </div>

      {/* 24/7 Emergency Strip */}
      <div className="bg-red-700 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-300" />
            <span className="text-xs font-bold uppercase tracking-wider text-red-200">
              Immediate Life-Saving Priority
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            24/7 National Emergency Blood Hotline
          </h2>
          <p className="text-xs text-red-100 max-w-xl">
            Toll-free emergency line connected to participating regional blood bank intake centers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <a
            href="tel:18007335433"
            className="flex items-center gap-2 px-5 py-3 bg-white text-red-700 font-extrabold text-sm rounded-xl shadow-md hover:bg-red-50 transition-colors"
          >
            <Phone className="w-4 h-4 text-red-600" />
            <span>1-800-RED-LIFE (733-5433)</span>
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Contact Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Send an Inquiry or Feedback</h3>
            <p className="text-xs text-slate-500 mt-0.5">We respond to hospital and donor inquiries within 2 hours</p>
          </div>

          {submitted && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Thank you! Your inquiry has been routed to our regional medical coordinator.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Arthur Pendelton"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="arthur@hospital.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject *</label>
              <input
                type="text"
                required
                placeholder="e.g. Hospital Blood Bank Registration / Urgent Supply Issue"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message *</label>
              <textarea
                rows={4}
                required
                placeholder="Describe your inquiry, clinical center requirements, or questions..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Submit Inquiry
            </button>
          </form>
        </div>

        {/* Right: Hospital Desks & FAQs */}
        <div className="lg:col-span-5 space-y-6">
          {/* Regional Coordination Centers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Affiliated Regional Blood Centers</h3>
            <div className="space-y-3 text-xs text-slate-600">
              <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">New York Metropolitan Blood Center</h4>
                  <p className="text-[11px] text-slate-500">310 E 67th St, New York, NY · Tel: (212) 570-3000</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Chicago Midwest Transfusion Hub</h4>
                  <p className="text-[11px] text-slate-500">251 E Huron St, Chicago, IL · Tel: (312) 926-2000</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900">Texas Medical Center Blood Desk</h4>
                  <p className="text-[11px] text-slate-500">6565 Fannin St, Houston, TX · Tel: (713) 790-3311</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Accordion */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <h3 className="text-base font-bold text-slate-900 mb-2">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border border-slate-200 rounded-xl overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                    className="w-full text-left p-3.5 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-bold text-slate-900 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {openFaq === idx ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  {openFaq === idx && (
                    <div className="p-3.5 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
