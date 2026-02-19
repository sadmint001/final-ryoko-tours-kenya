import React from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronRight, Lock, Eye, FileText, Scale, Globe, Mail, Phone, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const PrivacyPolicy = () => {
    const lastUpdated = "November 12th 2025";

    const sections = [
        {
            id: "commitment",
            title: "1. Our Commitment to Privacy",
            icon: Shield,
            content: "We respect your right to privacy and are committed to processing personal data lawfully, fairly, transparently, and securely, in accordance with section 25 of the Data Protection Act, 2019."
        },
        {
            id: "definitions",
            title: "2. Definitions",
            icon: FileText,
            content: "In this Policy, terms such as personal data, processing, data subject, data controller, and data processor have the meanings assigned to them under the Data Protection Act, 2019."
        },
        {
            id: "controller",
            title: "3. Data Controller",
            icon: Scale,
            content: (
                <div className="space-y-2">
                    <p>Ryoko Tours Africa is the data controller responsible for personal data processed through this website.</p>
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700">
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <Mail className="w-4 h-4 text-amber-600" />
                            <span>Email: info@ryokotoursafrica.com</span>
                        </p>
                        <p className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                            <Phone className="w-4 h-4 text-amber-600" />
                            <span>Phone: 0797-758-216</span>
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: "collection",
            title: "4. Personal Data We Collect",
            icon: Eye,
            content: (
                <div className="space-y-4">
                    <p>We only collect personal data that is adequate, relevant, and limited to what is necessary for our services.</p>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">4.1 General Enquiries</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                            </ul>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <h4 className="font-bold text-slate-800 dark:text-white mb-2">4.2 Booking</h4>
                            <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400">
                                <li>Full name</li>
                                <li>Email address</li>
                                <li>Phone number</li>
                                <li>Selected payment method (we do not store full card or mobile credentials)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: "purpose",
            title: "5. Purpose of Data Collection",
            icon: FileText,
            content: (
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                    <li>Responding to enquiries and customer communications</li>
                    <li>Creating and managing tour bookings and reservations</li>
                    <li>Facilitating payments and confirming transactions</li>
                    <li>Providing customer support and travel-related updates</li>
                    <li>Fulfilling contractual obligations</li>
                    <li>Complying with legal and regulatory requirements</li>
                </ul>
            )
        },
        {
            id: "basis",
            title: "6. Lawful Basis for Processing",
            icon: Scale,
            content: "Personal data is processed in accordance with section 30 of the Data Protection Act, 2019, on the basis of: Consent of the data subject, Performance of a contract, Compliance with a legal obligation, and Legitimate business interests."
        },
        {
            id: "consent",
            title: "7. Consent",
            icon: Shield,
            content: "Consent is obtained expressly, freely, and in an informed manner. Data subjects may withdraw consent at any time, though this does not affect processing carried out prior to withdrawal."
        },
        {
            id: "sharing",
            title: "8. Data Sharing and Disclosure",
            icon: Lock,
            content: "We do not sell personal data. Data may be shared with trusted third-party service providers (payment processors/booking partners) strictly for service delivery, or where required by law."
        },
        {
            id: "transfers",
            title: "9. Cross-Border Data Transfers",
            icon: Globe,
            content: "Where personal data is transferred outside Kenya, adequate safeguards are ensured in accordance with sections 48 and 49 of the Data Protection Act, 2019."
        },
        {
            id: "security",
            title: "10. Data Security",
            icon: Lock,
            content: "We implement technical and organisational measures including access controls, data minimisation, secure hosting, and encryption to safeguard your data."
        },
        {
            id: "retention",
            title: "11. Data Retention",
            icon: Clock,
            content: "Personal data is retained only for as long as necessary to fulfil the purposes for which it was collected, or as required by law, after which it is securely deleted or anonymised."
        },
        {
            id: "rights",
            title: "12. Rights of Data Subjects",
            icon: Shield,
            content: (
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400">
                    <li>Be informed about the use of your personal data</li>
                    <li>Access personal data held about you</li>
                    <li>Object to processing or request restriction</li>
                    <li>Request correction of inaccurate data</li>
                    <li>Request deletion (right to be forgotten)</li>
                    <li>Withdraw consent at any time</li>
                </ul>
            )
        },
        {
            id: "breach",
            title: "13. Data Breach Notification",
            icon: Shield,
            content: "In the event of a breach posing a real risk of harm, the Office of the Data Protection Commissioner will be notified within 72 hours, and affected subjects will be informed."
        },
        {
            id: "cookies",
            title: "14. Cookies and Analytics",
            icon: Globe,
            content: "Our website may use cookies to improve functionality. You can manage cookie preferences through your browser settings."
        },
        {
            id: "children",
            title: "15. Children’s Data",
            icon: Users,
            content: "Our services are not directed at children. Where a child's data is processed, parental or guardian consent shall be obtained in accordance with section 33 of the Act."
        },
        {
            id: "changes",
            title: "16. Changes to This Policy",
            icon: FileText,
            content: "We may update this Privacy Policy from time to time. Any changes will be published on this page with an updated revision date."
        },
        {
            id: "complaints",
            title: "17. Complaints",
            icon: Mail,
            content: (
                <p>
                    If you believe your data protection rights have been violated, you may lodge a complaint with us at{' '}
                    <a href="mailto:info@ryokotoursafrica.com" className="text-amber-600 hover:underline">info@ryokotoursafrica.com</a> or{' '}
                    <a href="mailto:support@ryokotoursafrica.com" className="text-amber-600 hover:underline">support@ryokotoursafrica.com</a>.
                </p>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-500">
            <Navbar />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 bg-slate-900 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-600/20 to-orange-900/40 opacity-50"></div>
                <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center justify-center gap-3 mb-6">
                            <div className="w-8 h-px bg-amber-500"></div>
                            <span className="text-xs font-bold uppercase tracking-[0.3em] text-amber-200">Privacy & Security</span>
                            <div className="w-8 h-px bg-amber-500"></div>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold font-serif text-white mb-6">
                            Privacy <span className="text-amber-400 italic">Policy</span>
                        </h1>
                        <p className="text-slate-300 max-w-2xl mx-auto text-lg">
                            Details on how Ryoko Tours Africa collects, uses, and protects your personal data in accordance with Kenyan and International standards.
                        </p>
                        <div className="mt-8 text-slate-400 text-sm">
                            Last updated: <span className="text-amber-400 font-medium">{lastUpdated}</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Breadcrumb */}
            <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-4 shadow-sm sticky top-16 z-20">
                <div className="container mx-auto px-4 flex items-center gap-2 text-sm overflow-x-auto whitespace-nowrap scrollbar-hide">
                    <Link to="/" className="text-slate-500 hover:text-amber-600 transition-colors">Home</Link>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-white">Privacy Policy</span>
                </div>
            </div>

            <main className="container mx-auto px-4 py-16">
                <div className="max-w-4xl mx-auto">
                    {/* Introduction */}
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xl mb-12">
                        <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-lg">
                            This Privacy Policy explains how Ryoko Tours Africa ("we", "our", "us") collects, uses, stores, discloses, and protects personal data obtained through our website and related services. We are a tours and travel services provider serving both domestic and international clients.
                        </p>
                        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-xl">
                            <p className="text-amber-800 dark:text-amber-200 text-sm italic">
                                This Policy is prepared in compliance with the Data Protection Act, 2019 (Kenya) and is informed by internationally recognised data protection standards, including the EU General Data Protection Regulation (GDPR), where applicable.
                            </p>
                        </div>
                    </div>

                    {/* Policy Sections */}
                    <div className="space-y-8">
                        {sections.map((section, index) => (
                            <motion.section
                                key={section.id}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-white dark:bg-slate-800 p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start gap-6">
                                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                                        <section.icon className="w-6 h-6" />
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 font-serif">
                                            {section.title}
                                        </h2>
                                        <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                                            {section.content}
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        ))}
                    </div>

                    {/* Conclusion */}
                    <div className="mt-16 text-center text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/50 py-12 px-6 rounded-[3rem] border border-dashed border-slate-300 dark:border-slate-700">
                        <p className="text-lg mb-4">
                            By using our website and services, you acknowledge that you have read and understood this Privacy Policy.
                        </p>
                        <p className="text-sm">
                            © {new Date().getFullYear()} Ryoko Tours Africa. All rights reserved.
                        </p>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
