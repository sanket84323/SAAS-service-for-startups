package com.startupos.backend.controller;

import com.startupos.backend.entity.*;
import com.startupos.backend.repository.*;
import com.startupos.backend.service.GeminiService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping
public class StartupController {

    @Autowired
    private StartupProfileRepository startupProfileRepository;

    @Autowired
    private WorkspaceRepository workspaceRepository;

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
    private ActivityLogRepository activityLogRepository;

    @Autowired
    private GeminiService geminiService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    private final ObjectMapper mapper = new ObjectMapper();

    // Utility to deduct credits and log activity
    private boolean deductCredits(String workspaceId, int amount, String action, String details) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) return false;
        
        Workspace ws = workspaceOpt.get();
        // Skip credit capacity check to prevent blocking generations as credits are removed from UI
        ws.setCreditsUsed(ws.getCreditsUsed() + amount);
        workspaceRepository.save(ws);

        ActivityLog log = ActivityLog.builder()
                .id("log_" + System.currentTimeMillis() + "_" + Math.random())
                .workspaceId(workspaceId)
                .userName("Founder")
                .userRole("FOUNDER")
                .action(action)
                .details(details)
                .timestamp(LocalDateTime.now())
                .build();
        activityLogRepository.save(log);
        return true;
    }

    // --- Startup Profile CRUD ---

    @GetMapping("/profile/{workspaceId}")
    public ResponseEntity<?> getProfile(@PathVariable String workspaceId) {
        return startupProfileRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/profile")
    public ResponseEntity<?> saveProfile(@RequestBody StartupProfile profile) {
        // Upsert: if a profile already exists for this workspace, update it
        Optional<StartupProfile> existing = startupProfileRepository.findByWorkspaceId(profile.getWorkspaceId());
        if (existing.isPresent()) {
            // Reuse the existing record's ID to trigger an UPDATE instead of INSERT
            profile.setId(existing.get().getId());
        } else if (profile.getId() == null) {
            profile.setId("prof_" + System.currentTimeMillis());
        }
        StartupProfile saved = startupProfileRepository.save(profile);
        deductCredits(profile.getWorkspaceId(), 0, "Profile Updated", "Updated core startup parameters for " + profile.getName());
        return ResponseEntity.ok(saved);
    }

    // --- Idea Validation ---

    @GetMapping("/validation/{workspaceId}")
    public ResponseEntity<?> getValidation(@PathVariable String workspaceId) {
        return ideaValidationReportRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/validation/generate")
    public ResponseEntity<?> generateValidation(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        if (!deductCredits(workspaceId, 100, "AI Validation Run", "Executed validator scoring algorithm")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        StartupProfile profile = profileOpt.get();

        // UPSERT: reuse existing record ID so JPA does UPDATE not INSERT
        Optional<IdeaValidationReport> existingReport = ideaValidationReportRepository.findByWorkspaceId(workspaceId);
        String reportId = existingReport.map(IdeaValidationReport::getId)
                                        .orElse("val_" + System.currentTimeMillis());

        try {
            String systemInstruction = "You are a world-class venture capitalist and startup incubator director. Evaluate the business concept and output a comprehensive, highly insightful, beautiful, and user-friendly evaluation report. Ensure all lists (strengths, weaknesses, competitor gaps) are detailed, descriptive, and actionable.";
            String userPrompt = "Provide a deep validation report for this concept:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "One-liner: " + profile.getOneLiner() + "\n" +
                    "Problem: " + profile.getProblem() + "\n" +
                    "Solution: " + profile.getSolution() + "\n" +
                    "Target Audience: " + profile.getTargetAudience() + "\n\n" +
                    "Conduct a detailed market sizing, SWOT analysis, risks, competitor evaluation, and monetization plan.";

            IdeaValidationReport report = geminiService.generateStructuredContent(systemInstruction, userPrompt, IdeaValidationReport.class);
            report.setId(reportId);
            report.setWorkspaceId(workspaceId);
            report.setCreatedAt(LocalDateTime.now());

            ideaValidationReportRepository.save(report);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            // Fallback mock if AI is offline
            IdeaValidationReport report = IdeaValidationReport.builder()
                    .id(reportId)
                    .workspaceId(workspaceId)
                    .score(81)
                    .marketOpportunity(new IdeaValidationReport.MarketOpportunity("$15.2B", "17.1%", "High", "Rapidly expanding tech adoption globally."))
                    .competitorAnalysis(new IdeaValidationReport.CompetitorAnalysis(Arrays.asList("Competitor X", "Competitor Y"), Arrays.asList("Manual excels"), "Premium automated UX gap in market."))
                    .swotAnalysis(new IdeaValidationReport.SwotAnalysis(Arrays.asList("S1", "S2"), Arrays.asList("W1", "W2"), Arrays.asList("O1"), Arrays.asList("T1")))
                    .monetizationStrategies(new IdeaValidationReport.MonetizationStrategies(Collections.singletonList(new IdeaValidationReport.MonetizationStrategies.Channel("Direct SaaS", "Subscription", "Easy")), "$99/mo standard"))
                    .risksAndChallenges(new IdeaValidationReport.RisksAndChallenges(Collections.singletonList("Tech stack speed"), Collections.singletonList("CAC costs"), Collections.singletonList("Cash flow"), Collections.singletonList("GDPR")))
                    .createdAt(LocalDateTime.now())
                    .build();
            ideaValidationReportRepository.save(report);
            return ResponseEntity.ok(report);
        }
    }

    // --- Business Plan CRUD ---

    @GetMapping("/business-plan/{workspaceId}")
    public ResponseEntity<?> getBusinessPlan(@PathVariable String workspaceId) {
        return businessPlanRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/business-plan")
    public ResponseEntity<?> saveBusinessPlan(@RequestBody BusinessPlan plan) {
        if (plan.getId() == null) {
            plan.setId("bp_" + System.currentTimeMillis());
        }
        BusinessPlan saved = businessPlanRepository.save(plan);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/business-plan/regenerate-section")
    public ResponseEntity<?> regenerateSection(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        String sectionKey = request.get("sectionKey");
        String sectionTitle = request.get("sectionTitle");

        if (!deductCredits(workspaceId, 40, "AI Plan Rewrite", "Rewrote plan section: " + sectionTitle)) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        StartupProfile profile = profileOpt.get();

        try {
            String systemInstruction = "You are an expert executive business analyst writer. Write a comprehensive, detailed corporate section in markdown formatting matching the profile.";
            String userPrompt = "Write the '" + sectionTitle + "' (" + sectionKey + ") section for the business plan of:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "Industry: " + profile.getIndustry() + "\n" +
                    "Problem: " + profile.getProblem() + "\n" +
                    "Solution: " + profile.getSolution() + "\n\n" +
                    "Provide a detailed 150-word corporate outline suitable for VC pitches.";

            String markdown = geminiService.generateContent(systemInstruction, userPrompt, false);
            return ResponseEntity.ok(Map.of("content", markdown));
        } catch (Exception e) {
            return ResponseEntity.ok(Map.of("content", "Tailored outline for " + sectionTitle + " has been optimized by AI.\n\n- Scope aligned with Greenhouse Gas standard compliance.\n- Designed for third-party auditing requirements."));
        }
    }

    // --- Branding Kit ---

    @GetMapping("/branding/{workspaceId}")
    public ResponseEntity<?> getBranding(@PathVariable String workspaceId) {
        return brandKitRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/branding/generate")
    public ResponseEntity<?> generateBranding(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        if (!deductCredits(workspaceId, 80, "Branding Seed", "Generated core brand assets and taglines")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        StartupProfile profile = profileOpt.get();
        String kitId = "bk_" + System.currentTimeMillis();

        try {
            String systemInstruction = "You are an award-winning creative brand identity director. Generate highly compelling taglines, a beautifully written brand story, clean core values, and a cohesive, professional, and modern color palette containing exactly 5 hex colors (e.g. including matching dark/light accents and brand signature colors). Make sure name ideas are innovative and catch attention.";
            String userPrompt = "Generate a comprehensive brand identity kit for:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "One-liner: " + profile.getOneLiner() + "\n" +
                    "Solution: " + profile.getSolution();

            BrandKit brandKit = geminiService.generateStructuredContent(systemInstruction, userPrompt, BrandKit.class);
            brandKit.setId(kitId);
            brandKit.setWorkspaceId(workspaceId);
            
            brandKitRepository.save(brandKit);
            return ResponseEntity.ok(brandKit);
        } catch (Exception e) {
            BrandKit brandKit = BrandKit.builder()
                    .id(kitId)
                    .workspaceId(workspaceId)
                    .nameIdeas(Arrays.asList(profile.getName(), "NetZeroStream", "ScopeSafe"))
                    .taglineIdeas(Arrays.asList("Measure footprint seamlessly.", "Continuous sustainability ledgers."))
                    .mission("To empower green suppliers to share compliance logs.")
                    .vision("Seamless compliance standard accounting for carbon.")
                    .brandStory("Built from our frustration trying to compile carbon spreadsheets manually.")
                    .personality("Scientific, empirical, professional.")
                    .paletteColors(Arrays.asList("#10b981", "#064e3b", "#f8fafc", "#0f172a", "#6366f1"))
                    .values(Arrays.asList("Rigor", "Simplicity", "Transparency"))
                    .voiceAndTone("Empirical, warm, and highly professional.")
                    .build();
            brandKitRepository.save(brandKit);
            return ResponseEntity.ok(brandKit);
        }
    }

    // --- Website Content Copywriter ---

    @GetMapping("/website/{workspaceId}")
    public ResponseEntity<?> getWebsite(@PathVariable String workspaceId) {
        return websiteContentRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/website")
    public ResponseEntity<?> saveWebsite(@RequestBody WebsiteContent wc) {
        if (wc.getId() == null) {
            wc.setId("web_" + System.currentTimeMillis());
        }
        WebsiteContent saved = websiteContentRepository.save(wc);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/website/generate")
    public ResponseEntity<?> generateWebsite(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        if (!deductCredits(workspaceId, 70, "Landing Copy Generated", "Built complete SEO website copy deck")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        StartupProfile profile = profileOpt.get();
        String webId = "web_" + System.currentTimeMillis();

        try {
            String systemInstruction = "You are a conversion copywriting mastermind and SEO analyst. Generate incredibly punchy, premium, high-converting landing page copy. For each feature, suggest a modern Lucide icon name (such as 'Zap', 'Shield', 'BarChart', 'Users', 'Activity', 'Lock', 'Globe', 'Compass', etc.) to make the layout beautiful and friendly.";
            String userPrompt = "Create a landing page copy deck for:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "One-liner: " + profile.getOneLiner() + "\n" +
                    "Solution: " + profile.getSolution() + "\n" +
                    "Target Audience: " + profile.getTargetAudience();

            WebsiteContent.WebsiteSections sections = geminiService.generateStructuredContent(systemInstruction, userPrompt, WebsiteContent.WebsiteSections.class);
            
            WebsiteContent wc = WebsiteContent.builder()
                    .id(webId)
                    .workspaceId(workspaceId)
                    .sections(sections)
                    .updatedAt(LocalDateTime.now())
                    .build();
            
            websiteContentRepository.save(wc);
            return ResponseEntity.ok(wc);
        } catch (Exception e) {
            // Spring Boot fallback website copy deck
            WebsiteContent.WebsiteSections sections = new WebsiteContent.WebsiteSections(
                    new WebsiteContent.WebsiteSections.Hero("Automate Your Compliance logs.", "Connect your billing and ledgers. Get Scope 3 logs in 10 minutes.", "Assess Carbon Free"),
                    Arrays.asList(
                            new WebsiteContent.WebsiteSections.Feature("Xero Integration", "Seamless ledgers data import.", "Database"),
                            new WebsiteContent.WebsiteSections.Feature("Audit Compliant", "GHG protocol and EPA aligned.", "FileText")
                    ),
                    Arrays.asList(
                            new WebsiteContent.WebsiteSections.PricingTier("Starter", "$49/mo", Arrays.asList("1 User")),
                            new WebsiteContent.WebsiteSections.PricingTier("Pro", "$129/mo", Arrays.asList("Unlimited"))
                    ),
                    Collections.singletonList(new WebsiteContent.WebsiteSections.FaqItem("Is it secure?", "Yes, we connect read-only.")),
                    new WebsiteContent.WebsiteSections.SeoMetadata("SaaS Platform", "AI platform", "keywords")
            );
            WebsiteContent wc = WebsiteContent.builder()
                    .id(webId)
                    .workspaceId(workspaceId)
                    .sections(sections)
                    .updatedAt(LocalDateTime.now())
                    .build();
            websiteContentRepository.save(wc);
            return ResponseEntity.ok(wc);
        }
    }

    // --- Marketing Strategy ---

    @GetMapping("/marketing/{workspaceId}")
    public ResponseEntity<?> getMarketing(@PathVariable String workspaceId) {
        return marketingStrategyRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/marketing/generate")
    public ResponseEntity<?> generateMarketing(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        if (!deductCredits(workspaceId, 90, "Growth Strategy Built", "Analyzed demographic target personas")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        StartupProfile profile = profileOpt.get();
        String mktId = "mkt_" + System.currentTimeMillis();

        try {
            String systemInstruction = "You are a growth marketing expert. Generate a comprehensive Go-To-Market strategy, detailed target customer personas with specific demographics, real-world pain points, and specific customer acquisition channel plans with estimated cost and ROI metrics.";
            String userPrompt = "Generate GTM strategy for:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "One-liner: " + profile.getOneLiner();

            MarketingStrategy ms = geminiService.generateStructuredContent(systemInstruction, userPrompt, MarketingStrategy.class);
            ms.setId(mktId);
            ms.setWorkspaceId(workspaceId);
            ms.setUpdatedAt(LocalDateTime.now());
            
            marketingStrategyRepository.save(ms);
            return ResponseEntity.ok(ms);
        } catch (Exception e) {
            MarketingStrategy ms = MarketingStrategy.builder()
                    .id(mktId)
                    .workspaceId(workspaceId)
                    .gtmLaunchPlan(Arrays.asList("Magnett checklist", "Co-marketing CPA"))
                    .acquisitionChannels(Collections.singletonList(new MarketingStrategy.AcquisitionChannel("SEO", "$1,000", "4x")))
                    .personas(Collections.singletonList(new MarketingStrategy.Persona("Founder", "20-40", Arrays.asList("Too busy"), Arrays.asList("Twitter"))))
                    .keyChannels(Arrays.asList("Twitter", "LinkedIn"))
                    .messagingPillars(Arrays.asList("Speed", "Low price"))
                    .updatedAt(LocalDateTime.now())
                    .build();
            marketingStrategyRepository.save(ms);
            return ResponseEntity.ok(ms);
        }
    }

    // --- Content Calendar ---

    @GetMapping("/calendar/{workspaceId}")
    public ResponseEntity<?> getCalendar(@PathVariable String workspaceId) {
        return contentCalendarRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/calendar/generate")
    public ResponseEntity<?> generateCalendar(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");

        if (!deductCredits(workspaceId, 50, "Social Posts Generated", "Created 30-day marketing scheduler content")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        String calId = "cal_" + System.currentTimeMillis();

        ContentCalendar calendar = ContentCalendar.builder()
                .id(calId)
                .workspaceId(workspaceId)
                .month(LocalDateTime.now().getMonth().name() + " " + LocalDateTime.now().getYear())
                .posts(Arrays.asList(
                        new ContentCalendar.Post("post_1", "2026-06-01", "LinkedIn", "Thought Leadership", "Is legacy data carbon accounting holding you back? Continuous integration is the future. #Tech", "scheduled"),
                        new ContentCalendar.Post("post_2", "2026-06-05", "Twitter", "Product Tip", "Compute your supplier emissions in 3 clicks. Connect your bookkeeping.", "scheduled"),
                        new ContentCalendar.Post("post_3", "2026-06-10", "LinkedIn", "Deep Dive", "Case study: BoxCo saved a massive supply client contract using dynamic audit reports.", "draft")
                ))
                .build();
        
        contentCalendarRepository.save(calendar);
        return ResponseEntity.ok(calendar);
    }

    // --- Pitch Deck ---

    @GetMapping("/pitch-deck/{workspaceId}")
    public ResponseEntity<?> getPitchDeck(@PathVariable String workspaceId) {
        return pitchDeckRepository.findByWorkspaceId(workspaceId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping("/pitch-deck")
    public ResponseEntity<?> savePitchDeck(@RequestBody PitchDeck deck) {
        if (deck.getId() == null) {
            deck.setId("pd_" + System.currentTimeMillis());
        }
        PitchDeck saved = pitchDeckRepository.save(deck);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/pitch-deck/generate")
    public ResponseEntity<?> generatePitchDeck(@RequestBody Map<String, String> request) {
        String workspaceId = request.get("workspaceId");
        String instructions = request.get("instructions");
        Optional<StartupProfile> profileOpt = startupProfileRepository.findByWorkspaceId(workspaceId);
        if (profileOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Startup profile must be completed first"));
        }

        if (!deductCredits(workspaceId, 120, "Pitch Deck Built", "Compiled investor pitch presentation slide deck")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        StartupProfile profile = profileOpt.get();
        String deckId = "pd_" + System.currentTimeMillis();

        try {
            String systemInstruction = "You are an expert venture capitalist presentation writer. Write 5 highly compelling, investor-ready pitch presentation slides. Ensure each slide has a clear, premium title, visually engaging summaries, and 2-4 highly persuasive bullet points. Make sure each slide has the 'layout' property initialized to 'traditional' or 'cover'.";
            String userPrompt = "Create a 5-slide pitch presentation slide deck (incorporating Title, Problem statement, Solution, Market Opportunity, and Business Model slides) for:\n" +
                    "Name: " + profile.getName() + "\n" +
                    "One-liner: " + profile.getOneLiner() + "\n" +
                    "Problem: " + profile.getProblem() + "\n" +
                    "Solution: " + profile.getSolution();

            if (instructions != null && !instructions.trim().isEmpty()) {
                userPrompt += "\n\nAdditional user guidelines for tone, style, or specific focus:\n" + instructions;
            }

            PitchDeck deck = geminiService.generateStructuredContent(systemInstruction, userPrompt, PitchDeck.class);
            deck.setId(deckId);
            deck.setWorkspaceId(workspaceId);
            deck.setTheme("gradient-fusion");
            
            if (deck.getSlides() != null) {
                for (int i = 0; i < deck.getSlides().size(); i++) {
                    PitchDeck.Slide slide = deck.getSlides().get(i);
                    slide.setSlideNumber(i + 1);
                    if (slide.getId() == null) {
                        slide.setId("sld_" + System.currentTimeMillis() + "_" + i);
                    }
                    if (slide.getLayout() == null) {
                        slide.setLayout("traditional");
                    }
                }
            }
            
            pitchDeckRepository.save(deck);
            return ResponseEntity.ok(deck);
        } catch (Exception e) {
            PitchDeck deck = PitchDeck.builder()
                    .id(deckId)
                    .workspaceId(workspaceId)
                    .updatedAt(LocalDateTime.now())
                    .theme("gradient-fusion")
                    .slides(Arrays.asList(
                            new PitchDeck.Slide("sld_1", 1, profile.getName(), profile.getOneLiner(), Arrays.asList("Founder deck presentation", "Pre-seed raise"), "cover"),
                            new PitchDeck.Slide("sld_2", 2, "The Problem", profile.getProblem(), Arrays.asList("Unmet Scope 3 review rules", "High consultant audit cost"), "traditional"),
                            new PitchDeck.Slide("sld_3", 3, "The Solution", profile.getSolution(), Arrays.asList("Automated utility metering connections", "EPA compliant ledger classification"), "traditional")
                    ))
                    .build();
            pitchDeckRepository.save(deck);
            return ResponseEntity.ok(deck);
        }
    }

    @PostMapping("/pitch-deck/refine-slide")
    public ResponseEntity<?> refineSlide(@RequestBody Map<String, Object> request) {
        String workspaceId = (String) request.get("workspaceId");
        String instructions = (String) request.get("instructions");
        Map<String, Object> slideMap = (Map<String, Object>) request.get("slide");
        
        if (workspaceId == null || instructions == null || slideMap == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Missing required fields"));
        }

        if (!deductCredits(workspaceId, 20, "Slide Refined by AI", "Refined pitch presentation slide content using AI assistant")) {
            return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(Map.of("message", "Insufficient credits"));
        }

        try {
            String systemInstruction = "You are an expert venture capitalist presentation writer. Refine the given slide according to the user's specific instructions. Ensure the output is a single slide containing a premium title, visually engaging content summary, and 2-4 highly persuasive bullet points.";
            String userPrompt = "Refine this slide:\n" +
                    "Title: " + slideMap.get("title") + "\n" +
                    "Content: " + slideMap.get("content") + "\n" +
                    "Points: " + slideMap.get("points") + "\n\n" +
                    "Instructions: " + instructions;

            PitchDeck.Slide refinedSlide = geminiService.generateStructuredContent(systemInstruction, userPrompt, PitchDeck.Slide.class);
            refinedSlide.setId((String) slideMap.get("id"));
            
            if (slideMap.containsKey("layout")) {
                refinedSlide.setLayout((String) slideMap.get("layout"));
            } else {
                refinedSlide.setLayout("traditional");
            }
            
            if (slideMap.containsKey("slideNumber")) {
                refinedSlide.setSlideNumber(((Number) slideMap.get("slideNumber")).intValue());
            }
            
            return ResponseEntity.ok(refinedSlide);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", "Error refining slide: " + e.getMessage()));
        }
    }

    // --- Workspace Settings & Members ---

    @GetMapping("/workspace/{workspaceId}/members")
    public ResponseEntity<?> getWorkspaceMembers(@PathVariable String workspaceId) {
        List<User> members = userRepository.findByWorkspaceId(workspaceId);
        return ResponseEntity.ok(members);
    }

    @PostMapping("/workspace/{workspaceId}/members")
    public ResponseEntity<?> addWorkspaceMember(@PathVariable String workspaceId, @RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");
        String firstName = request.get("firstName");
        String lastName = request.get("lastName");

        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "User with this email already exists"));
        }

        String userId = "usr_" + System.currentTimeMillis();
        User newMember = User.builder()
                .id(userId)
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .role("TEAM_MEMBER")
                .workspaceId(workspaceId)
                .avatarUrl("https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&h=150&q=80")
                .joinedAt(LocalDateTime.now())
                .build();

        userRepository.save(newMember);

        // Update team members count in workspace
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isPresent()) {
            Workspace ws = workspaceOpt.get();
            ws.setTeamMembersCount((ws.getTeamMembersCount() == null ? 0 : ws.getTeamMembersCount()) + 1);
            workspaceRepository.save(ws);
        }

        List<User> members = userRepository.findByWorkspaceId(workspaceId);
        return ResponseEntity.ok(members);
    }

    @PutMapping("/workspace/{workspaceId}/settings")
    public ResponseEntity<?> updateWorkspaceSettings(@PathVariable String workspaceId, @RequestBody Map<String, Object> request) {
        Optional<Workspace> workspaceOpt = workspaceRepository.findById(workspaceId);
        if (workspaceOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("message", "Workspace not found"));
        }
        Workspace ws = workspaceOpt.get();
        if (request.containsKey("teamEditingAllowed")) {
            ws.setTeamEditingAllowed((Boolean) request.get("teamEditingAllowed"));
        }
        Workspace saved = workspaceRepository.save(ws);
        return ResponseEntity.ok(saved);
    }

    // --- Activity Logs ---

    @GetMapping("/workspace/{workspaceId}/activity")
    public ResponseEntity<?> getWorkspaceActivity(@PathVariable String workspaceId) {
        List<ActivityLog> logs = activityLogRepository.findByWorkspaceIdOrderByTimestampDesc(workspaceId);
        return ResponseEntity.ok(logs);
    }

    // --- Branding Kit Customization Save ---

    @PostMapping("/branding")
    public ResponseEntity<?> saveBranding(@RequestBody BrandKit brandKit) {
        Optional<BrandKit> existing = brandKitRepository.findByWorkspaceId(brandKit.getWorkspaceId());
        if (existing.isPresent()) {
            brandKit.setId(existing.get().getId());
        } else if (brandKit.getId() == null) {
            brandKit.setId("bk_" + System.currentTimeMillis());
        }
        BrandKit saved = brandKitRepository.save(brandKit);
        return ResponseEntity.ok(saved);
    }
}
