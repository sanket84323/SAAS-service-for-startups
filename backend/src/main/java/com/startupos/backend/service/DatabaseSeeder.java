package com.startupos.backend.service;

import com.startupos.backend.entity.*;
import com.startupos.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Autowired
    private IdeaValidationReportRepository ideaValidationReportRepository;

    @Autowired
    private BusinessPlanRepository businessPlanRepository;

    @Autowired
    private BrandKitRepository brandKitRepository;

    @Autowired
    private WebsiteContentRepository websiteContentRepository;

    @Autowired
    private MarketingStrategyRepository marketingStrategyRepository;

    @Autowired
    private ContentCalendarRepository contentCalendarRepository;

    @Autowired
    private PitchDeckRepository pitchDeckRepository;

    @Autowired
    private ChatSessionRepository chatSessionRepository;

    @Autowired
    private ChatMessageRepository chatMessageRepository;

    @Autowired
    private UploadedDocumentRepository uploadedDocumentRepository;

    @Autowired
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (userRepository.count() == 0) {
            seedDatabase();
        }
        // Data patch: ensure the demo workspace is linked to the demo user email
        workspaceRepository.findById("wsp_ecosphere").ifPresent(ws -> {
            boolean updated = false;
            if (ws.getUserEmail() == null || ws.getUserEmail().isEmpty()) {
                ws.setUserEmail("piyush@startupos.com");
                updated = true;
            }
            if (ws.getTeamEditingAllowed() == null) {
                ws.setTeamEditingAllowed(false);
                updated = true;
            }
            if (updated) {
                workspaceRepository.save(ws);
                System.out.println(">>> Patched wsp_ecosphere: linked to piyush@startupos.com");
            }
        });

        // Data patch: ensure seeded users are linked to wsp_ecosphere
        userRepository.findByEmail("piyush@startupos.com").ifPresent(u -> {
            if (u.getWorkspaceId() == null) {
                u.setWorkspaceId("wsp_ecosphere");
                userRepository.save(u);
                System.out.println(">>> Patched user piyush@startupos.com with workspaceId wsp_ecosphere");
            }
        });
        userRepository.findByEmail("sarah@startupos.com").ifPresent(u -> {
            if (u.getWorkspaceId() == null) {
                u.setWorkspaceId("wsp_ecosphere");
                userRepository.save(u);
                System.out.println(">>> Patched user sarah@startupos.com with workspaceId wsp_ecosphere");
            }
        });
    }

    private void seedDatabase() {
        System.out.println(">>> Database is empty. Seeding AI StartupOS initial workspace templates...");

        // 1. Seed Users
        User founder = User.builder()
                .id("usr_founder")
                .firstName("Piyush")
                .lastName("Sakha")
                .email("piyush@startupos.com")
                .password(passwordEncoder.encode("password"))
                .role("FOUNDER")
                .workspaceId("wsp_ecosphere")
                .avatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80")
                .joinedAt(LocalDateTime.now().minusDays(15))
                .build();

        User member = User.builder()
                .id("usr_teammember")
                .firstName("Sarah")
                .lastName("Chen")
                .email("sarah@startupos.com")
                .password(passwordEncoder.encode("password"))
                .role("TEAM_MEMBER")
                .workspaceId("wsp_ecosphere")
                .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80")
                .joinedAt(LocalDateTime.now().minusDays(10))
                .build();

        User admin = User.builder()
                .id("usr_admin")
                .firstName("Alex")
                .lastName("Miller")
                .email("admin@startupos.com")
                .password(passwordEncoder.encode("password"))
                .role("ADMIN")
                .avatarUrl("https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80")
                .joinedAt(LocalDateTime.now().minusDays(20))
                .build();

        userRepository.saveAll(Arrays.asList(founder, member, admin));

        // 2. Seed Workspace
        Workspace workspace = Workspace.builder()
                .id("wsp_ecosphere")
                .name("EcoSphere AI")
                .industry("Sustainability Technology")
                .description("AI-driven carbon footprint tracking and offsets optimizer for small and medium businesses (SMBs).")
                .targetAudience("SMBs striving for net-zero carbon operations.")
                .userEmail("piyush@startupos.com")
                .activePlan("PRO")
                .creditsUsed(1450)
                .creditsLimit(5000)
                .teamMembersCount(2)
                .createdAt(LocalDateTime.now().minusDays(15))
                .build();

        workspaceRepository.save(workspace);

        // 3. Seed Startup Profile
        StartupProfile profile = StartupProfile.builder()
                .id("prof_ecosphere")
                .workspaceId("wsp_ecosphere")
                .name("EcoSphere AI")
                .industry("Sustainability Tech")
                .targetAudience("SMBs, specifically retailers, logistics startups, and tech companies.")
                .oneLiner("Track, reduce, and offset your business carbon footprint with automated AI analytics.")
                .problem("SMBs face pressure from clients and regulators to reduce emissions, but hiring consultants costs $10k+ and existing software is too complex.")
                .solution("A simple integration that aggregates utility bills, logistics data, and cloud hosting spend, calculates emissions via AI, and recommends targeted reduction activities.")
                .competitors("Watershed (Enterprise focused, expensive), Sweep (Mid-market), Treebly (Manual entries).")
                .revenueModel("SaaS subscription model starting at $79/month, plus a 5% brokerage fee on carbon offset purchases.")
                .build();

        startupProfileRepository.save(profile);

        // 4. Seed Idea Validation Report
        IdeaValidationReport report = IdeaValidationReport.builder()
                .id("val_ecosphere")
                .workspaceId("wsp_ecosphere")
                .score(84)
                .createdAt(LocalDateTime.now().minusDays(14))
                .marketOpportunity(new IdeaValidationReport.MarketOpportunity(
                        "$12.4 Billion",
                        "18.4%",
                        "High",
                        "The global SMB sustainability market is expanding rapidly due to corporate supply-chain net-zero requirements."
                ))
                .competitorAnalysis(new IdeaValidationReport.CompetitorAnalysis(
                        Arrays.asList("Watershed", "Sweep", "Greenly"),
                        Arrays.asList("Manual Excel templates", "Environmental consulting agencies"),
                        "Most tools focus on enterprise companies with massive budgets. EcoSphere serves the underserved SMB layer."
                ))
                .swotAnalysis(new IdeaValidationReport.SwotAnalysis(
                        Arrays.asList("Automated expense carbon modeling", "Low cost compared to consulting", "Fast setup in 10 mins"),
                        Arrays.asList("Relies on expense proxies", "Third-party API dependencies", "Nascent market segment"),
                        Arrays.asList("California SB 253 compliance", "White-label for accountants", "Carbon offset commission"),
                        Arrays.asList("Incumbent accounting software expansion", "Greenwashing registry crackdowns", "Corporate budget cuts")
                ))
                .monetizationStrategies(new IdeaValidationReport.MonetizationStrategies(
                        Arrays.asList(
                                new IdeaValidationReport.MonetizationStrategies.Channel("Self-serve SaaS", "Subscription", "Easy"),
                                new IdeaValidationReport.MonetizationStrategies.Channel("White-label Accountant Partners", "B2B2C Reseller", "Medium"),
                                new IdeaValidationReport.MonetizationStrategies.Channel("Certified Offset Marketplace commission", "Transactional Fee", "Medium")
                        ),
                        "$79/mo Basic, $199/mo Pro (includes supplier API and custom dashboard), $499/mo Enterprise."
                ))
                .risksAndChallenges(new IdeaValidationReport.RisksAndChallenges(
                        Collections.singletonList("Building robust semantic mappers for raw financial ledger descriptions."),
                        Collections.singletonList("Low initial willingness-to-pay from businesses who do not feel regulatory pressure."),
                        Collections.singletonList("High client acquisition cost compared to low monthly price."),
                        Collections.singletonList("Constantly evolving carbon accounting metrics.")
                ))
                .build();

        ideaValidationReportRepository.save(report);

        // 5. Seed Business Plan
        BusinessPlan plan = BusinessPlan.builder()
                .id("bp_ecosphere")
                .workspaceId("wsp_ecosphere")
                .version(1)
                .updatedAt(LocalDateTime.now().minusDays(13))
                .sections(Arrays.asList(
                        new BusinessPlan.Section("sec_1", "Executive Summary", "executiveSummary", "EcoSphere AI is a sustainability platform designed to democratize carbon footprint management for SMBs. Connects utility bills and ledgers directly."),
                        new BusinessPlan.Section("sec_2", "Problem Statement", "problemStatement", "B2B suppliers are facing supply-chain emissions compliance reviews. Consulting is too expensive ($15k+)."),
                        new BusinessPlan.Section("sec_3", "Proposed Solution", "solution", "Connect QuickBooks/Xero and utilities. AI automatically maps ledger lines to CO2 equivalents."),
                        new BusinessPlan.Section("sec_4", "Market Analysis", "marketAnalysis", "Global environmental software market is valued at $9.3B and projected to reach $24.7B by 2030."),
                        new BusinessPlan.Section("sec_5", "Revenue Model", "revenueModel", "SaaS subscriptions + 5-8% margin on carbon offset transaction brokers."),
                        new BusinessPlan.Section("sec_6", "Operational Plan", "operationalPlan", "Software development pipelines + verification project partnerships (Gold Standard, Verra)."),
                        new BusinessPlan.Section("sec_7", "Financial Projections", "financialProjections", "Year 1: $150k ARR | Year 2: $1.1M ARR | Year 3: $4.8M ARR.")
                ))
                .build();

        businessPlanRepository.save(plan);

        // 6. Seed Brand Kit
        BrandKit brandKit = BrandKit.builder()
                .id("bk_ecosphere")
                .workspaceId("wsp_ecosphere")
                .nameIdeas(Arrays.asList("EcoSphere AI", "CarbonLedger", "NetZeroly", "AuraEco", "ScopeZero"))
                .taglineIdeas(Arrays.asList("Automate your climate action.", "Ledger accounting for the planet.", "Scope 3 carbon tracking made simple."))
                .mission("To empower 1 million businesses to automate, trace, and eliminate their greenhouse gas emissions through intelligent technology.")
                .vision("A world where climate accounting is as seamless, continuous, and standard as financial accounting.")
                .brandStory("We started EcoSphere AI when we saw local manufacturers lose contracts because they could not provide carbon disclosure reports to their enterprise buyers.")
                .personality("Professional, empirical, encouraging, and visionary.")
                .paletteColors(Arrays.asList("#10b981", "#064e3b", "#f8fafc", "#0f172a", "#6366f1"))
                .values(Arrays.asList("Radical Transparency", "Data Rigor", "Simplicity First", "Empowerment over Guilt"))
                .voiceAndTone("Empirical, warm, and highly professional. Avoid eco-jargon; focus on clarity and clear business value.")
                .build();

        brandKitRepository.save(brandKit);

        // 7. Seed Website Content
        WebsiteContent websiteContent = WebsiteContent.builder()
                .id("web_ecosphere")
                .workspaceId("wsp_ecosphere")
                .updatedAt(LocalDateTime.now().minusDays(12))
                .sections(new WebsiteContent.WebsiteSections(
                        new WebsiteContent.WebsiteSections.Hero(
                                "Automate Your Carbon Compliance. Retain Your Top Customers.",
                                "Instantly calculate, report, and reduce your business carbon footprint with AI. Connect your accounting and utility bills to get started in 10 minutes.",
                                "Start Free Assessment"
                        ),
                        Arrays.asList(
                                new WebsiteContent.WebsiteSections.Feature("Instant Ledgers Sync", "Connect with QuickBooks, Xero, or Sage. AI automatically maps transactions.", "Database"),
                                new WebsiteContent.WebsiteSections.Feature("Investor-Grade Reports", "Export reports that comply fully with GHG Protocol, CSRD, and Scope 3 requests.", "FileText"),
                                new WebsiteContent.WebsiteSections.Feature("Actionable Reduction Paths", "Get tailored recommendations to switch to green hosts and cut utility waste.", "TrendingDown")
                        ),
                        Arrays.asList(
                                new WebsiteContent.WebsiteSections.PricingTier("Starter", "$49/mo", Arrays.asList("1 User", "3 Integrations", "Scope 1 & 2 Reporting")),
                                new WebsiteContent.WebsiteSections.PricingTier("Growth", "$129/mo", Arrays.asList("5 Users", "Unlimited Integrations", "Scope 3 supplier base")),
                                new WebsiteContent.WebsiteSections.PricingTier("Enterprise", "Custom", Arrays.asList("Dedicated manager", "Custom API", "Third-party audit guarantee"))
                        ),
                        Arrays.asList(
                                new WebsiteContent.WebsiteSections.FaqItem("How does the AI map financial expenses?", "Our models parse transaction descriptions against EPA datasets to calculate emission values."),
                                new WebsiteContent.WebsiteSections.FaqItem("Are the reports audited?", "Yes, calculations adhere strictly to the Greenhouse Gas (GHG) Protocol framework.")
                        ),
                        new WebsiteContent.WebsiteSections.SeoMetadata(
                                "Carbon Tracking & Compliance Software for SMBs | EcoSphere AI",
                                "Calculate Scope 1, 2, and 3 emissions automatically.",
                                "carbon footprint calculator, scope 3 compliance, corporate carbon tracking"
                        )
                ))
                .build();

        websiteContentRepository.save(websiteContent);

        // 8. Seed Marketing Strategy
        MarketingStrategy marketingStrategy = MarketingStrategy.builder()
                .id("mkt_ecosphere")
                .workspaceId("wsp_ecosphere")
                .updatedAt(LocalDateTime.now().minusDays(11))
                .gtmLaunchPlan(Arrays.asList(
                        "Create high-value lead magnet: 'Scope 3 Compliance Checklist for B2B Suppliers'.",
                        "Run webinars focused on CPA and accounting firms to pitch EcoSphere as an add-on service.",
                        "Publish localized case studies showing SMBs that successfully retained enterprise contracts."
                ))
                .acquisitionChannels(Arrays.asList(
                        new MarketingStrategy.AcquisitionChannel("Organic Search (SEO)", "$2,000/mo", "350%"),
                        new MarketingStrategy.AcquisitionChannel("Accounting B2B Resellers", "$500/mo", "600%"),
                        new MarketingStrategy.AcquisitionChannel("LinkedIn Search Ads", "$3,500/mo", "120%")
                ))
                .personas(Arrays.asList(
                        new MarketingStrategy.Persona("Enterprise IT Manager", "35-50, Urban, High Income", Arrays.asList("Budget constraints", "Security compliance"), Arrays.asList("LinkedIn", "Webinars")),
                        new MarketingStrategy.Persona("Startup Founder", "25-40, Tech-savvy, Fast-paced", Arrays.asList("Limited time", "Cost optimization"), Arrays.asList("Twitter/X", "Product Hunt"))
                ))
                .keyChannels(Arrays.asList("LinkedIn B2B", "SEO Content Marketing", "Cold Email Outreach"))
                .messagingPillars(Arrays.asList("Efficiency & Speed", "Enterprise-Grade Security", "Seamless Integration"))
                .build();

        marketingStrategyRepository.save(marketingStrategy);

        // 9. Seed Content Calendar
        ContentCalendar calendar = ContentCalendar.builder()
                .id("cal_ecosphere")
                .workspaceId("wsp_ecosphere")
                .month(LocalDateTime.now().getMonth().name() + " " + LocalDateTime.now().getYear())
                .posts(Arrays.asList(
                        new ContentCalendar.Post("post_1", "2026-06-01", "LinkedIn", "Thought Leadership", "Is your company prepared for Scope 3 emissions reporting? Big enterprise buyers are starting to audit their entire supplier base.", "scheduled"),
                        new ContentCalendar.Post("post_2", "2026-06-03", "Twitter", "Product Tip", "Greenwashing is out, empirical data is in. Connect your utility smart meters directly.", "scheduled"),
                        new ContentCalendar.Post("post_3", "2026-06-05", "LinkedIn", "Case Study", "How small packaging firm BoxCo saved their $2.5M contracts with retail giants in under two weeks.", "draft")
                ))
                .build();

        contentCalendarRepository.save(calendar);

        // 10. Seed Pitch Deck
        PitchDeck pitchDeck = PitchDeck.builder()
                .id("pd_ecosphere")
                .workspaceId("wsp_ecosphere")
                .updatedAt(LocalDateTime.now().minusDays(10))
                .slides(Arrays.asList(
                        new PitchDeck.Slide("sld_1", 1, "EcoSphere AI", "Automated Carbon Accounting and Compliance for SMBs", Arrays.asList("Founder presentation deck", "Piyush Sakha, Founder & CEO")),
                        new PitchDeck.Slide("sld_2", 2, "The Problem", "B2B Suppliers are facing a climate disclosure crisis.", Arrays.asList("Enterprise buyers are auditing supplier carbon footprints.", "Hiring climate auditors costs $15k+.", "Manual reporting in spreadsheets is tedious.")),
                        new PitchDeck.Slide("sld_3", 3, "The Solution", "API-driven carbon tracking that integrates in minutes.", Arrays.asList("Instant connections to QuickBooks and electrical meters.", "Automated engine maps dollars to CO2 equivalents.", "One-click exporter for audit-ready compliance.")),
                        new PitchDeck.Slide("sld_4", 4, "Market Size & Opportunity", "A massive wave of regulatory requirements is hitting SMBs.", Arrays.asList("TAM: $12.4 Billion global market.", "Over 140,000 corporate vendors in the US & Europe need reporting shortly.", "California rules are legally binding requirements.")),
                        new PitchDeck.Slide("sld_5", 5, "Business Model", "High-margin SaaS coupled with transactional offset fees.", Arrays.asList("Subscription: $79/mo Starter, $199/mo Pro.", "Brokerage: 5-8% fees on certified carbon offset purchases."))
                ))
                .build();

        pitchDeckRepository.save(pitchDeck);

        // 11. Seed Chat Sessions & Messages
        ChatSession session = ChatSession.builder()
                .id("sess_1")
                .workspaceId("wsp_ecosphere")
                .title("Acquiring our first 10 customers")
                .createdAt(LocalDateTime.now().minusDays(5))
                .build();

        chatSessionRepository.save(session);

        ChatMessage userMsg = ChatMessage.builder()
                .id("msg_1")
                .sessionId("sess_1")
                .sender("USER")
                .content("Hi, I need ideas for acquiring our first 10 B2B manufacturing customers for EcoSphere AI. We have a budget of under $1,000.")
                .createdAt(LocalDateTime.now().minusDays(5).plusMinutes(1))
                .build();

        ChatMessage aiMsg = ChatMessage.builder()
                .id("msg_2")
                .sessionId("sess_1")
                .sender("AI")
                .content("Based on your profile for EcoSphere AI in Sustainability Tech, here is a targeted customer acquisition strategy: 1. Target B2B manufacturers who supply major retail groups. 2. Establish partner programs with local CPA firms. 3. Produce high-value checklists for supplier Scope 3 compliance.")
                .createdAt(LocalDateTime.now().minusDays(5).plusMinutes(2))
                .build();

        chatMessageRepository.saveAll(Arrays.asList(userMsg, aiMsg));

        // 12. Seed Uploaded Documents (RAG)
        UploadedDocument doc1 = UploadedDocument.builder()
                .id("doc_1")
                .workspaceId("wsp_ecosphere")
                .fileName("california_sb_253_compliance_standards.pdf")
                .fileSize("2.4 MB")
                .fileType("pdf")
                .chunkCount(142)
                .status("COMPLETED")
                .createdAt(LocalDateTime.now().minusDays(8))
                .build();

        UploadedDocument doc2 = UploadedDocument.builder()
                .id("doc_2")
                .workspaceId("wsp_ecosphere")
                .fileName("ghg_protocol_scope_3_calculation_guidelines.docx")
                .fileSize("1.8 MB")
                .fileType("docx")
                .chunkCount(98)
                .status("COMPLETED")
                .createdAt(LocalDateTime.now().minusDays(7))
                .build();

        uploadedDocumentRepository.saveAll(Arrays.asList(doc1, doc2));

        // 13. Seed Activity Logs
        ActivityLog log1 = ActivityLog.builder()
                .id("log_1")
                .workspaceId("wsp_ecosphere")
                .userName("Piyush Sakha")
                .userRole("FOUNDER")
                .action("Workspace Created")
                .details("EcoSphere AI workspace initialized.")
                .timestamp(LocalDateTime.now().minusDays(15))
                .build();

        ActivityLog log2 = ActivityLog.builder()
                .id("log_2")
                .workspaceId("wsp_ecosphere")
                .userName("Piyush Sakha")
                .userRole("FOUNDER")
                .action("Startup Profile Created")
                .details("Details for EcoSphere AI added to workspace profile.")
                .timestamp(LocalDateTime.now().minusDays(15).plusMinutes(15))
                .build();

        ActivityLog log3 = ActivityLog.builder()
                .id("log_3")
                .workspaceId("wsp_ecosphere")
                .userName("Piyush Sakha")
                .userRole("FOUNDER")
                .action("AI Validation Generated")
                .details("Startup Idea Validator run for EcoSphere AI. Score: 84.")
                .timestamp(LocalDateTime.now().minusDays(14))
                .build();

        ActivityLog log4 = ActivityLog.builder()
                .id("log_4")
                .workspaceId("wsp_ecosphere")
                .userName("Sarah Chen")
                .userRole("TEAM_MEMBER")
                .action("User Joined Workspace")
                .details("Joined workspace EcoSphere AI via email invite.")
                .timestamp(LocalDateTime.now().minusDays(10))
                .build();

        activityLogRepository.saveAll(Arrays.asList(log1, log2, log3, log4));

        System.out.println(">>> Database seeding completed successfully! Populated Users, Workspaces, Profiles, Plans, Calendars, Decks, Chats, and Logs.");
    }
}
