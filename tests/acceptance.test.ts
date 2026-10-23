import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_PROFILES } from '../src/data/seedProfiles.ts';
import { ProfileRepository } from '../src/services/profileRepository.ts';
import { CompatibilityService } from '../src/services/compatibilityService.ts';
import { ConversationService } from '../src/services/conversationService.ts';
import { AgentService } from '../src/services/agentService.ts';
import { ConsentService } from '../src/services/consentService.ts';
import { ImportService } from '../src/services/importService.ts';
import { parseCsv, exportToCsv } from '../src/utils/csvParser.ts';

describe('THE TEST — Acceptance Verification Suite', () => {
  // Phase 1 Baseline Invariants
  test('Criterion 2 & 3: Exactly 16 records loaded with accurate input data', () => {
    assert.equal(INITIAL_PROFILES.length, 16, 'Dataset must contain exactly 16 preliminary records');

    const expectedRecords = [
      {
        name: 'Vidhi Mandovara',
        linkedin: 'https://www.linkedin.com/in/vidhi-mandovara/',
        handle: 'vidhimandovara',
        url: 'https://www.instagram.com/vidhimandovara?dlrf=cGtjcnoxNnJrY3Br',
        dataStatus: 'user_supplied',
      },
      {
        name: 'Labdhi Mandovara',
        linkedin: 'https://www.linkedin.com/in/labdhi-mandovara-047561278/',
        handle: 'iamlabdhi',
        url: 'https://www.instagram.com/iamlabdhi/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Moksha J.',
        linkedin: 'https://www.linkedin.com/in/moksha-j-301859200/',
        handle: 'mokshaajain',
        url: 'https://www.instagram.com/mokshaajain/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Isha Jain',
        linkedin: 'https://www.linkedin.com/in/ishajainofficial/',
        handle: 'isha8580',
        url: 'https://www.instagram.com/isha8580/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Udit Jain',
        linkedin: 'https://www.linkedin.com/in/udit-jain-372179246/',
        handle: 'uditjainnnn',
        url: 'https://www.instagram.com/uditjainnnn/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Hanishk Shukla',
        linkedin: 'https://www.linkedin.com/in/hanishk-shukla-678632282/',
        handle: 'hanishq_',
        url: 'https://www.instagram.com/hanishq_/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Ashutosh Singh',
        linkedin: 'https://www.linkedin.com/in/ashutosh-singh-870a58285/',
        handle: 'ashu_kharayat',
        url: 'https://www.instagram.com/ashu_kharayat/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Alankar Tripathi',
        linkedin: 'https://www.linkedin.com/in/alankar-tripathi-a9a118286/',
        handle: 'allenkar_63',
        url: 'https://www.instagram.com/allenkar_63/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Prasakha Ganguly',
        linkedin: 'https://www.linkedin.com/in/prasakha-ganguly/',
        handle: 'prxsakha',
        url: 'https://www.instagram.com/prxsakha/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Chelsi Jain',
        linkedin: 'https://www.linkedin.com/in/chelsi-jain-894716274/',
        handle: 'chelsi_jainn',
        url: 'https://www.instagram.com/chelsi_jainn/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Soham Jade',
        linkedin: 'https://www.linkedin.com/in/soham-jade-459464285/',
        handle: 'soham.*.jade',
        url: null, // Constraint: URL withheld due to potentially invalid characters
        dataStatus: 'invalid_format_warning',
      },
      {
        name: 'Hussain Tayyebi',
        linkedin: 'https://www.linkedin.com/in/hussain-tayyebi-012255287/',
        handle: 'hussaintayyebi',
        url: 'https://www.instagram.com/hussaintayyebi/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Gayatri Apotikar',
        linkedin: 'https://www.linkedin.com/in/gayatri-apotikar-927674285/',
        handle: 'gayatriii_810',
        url: 'https://www.instagram.com/gayatriii_810/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Priti',
        linkedin: 'https://www.linkedin.com/in/priti-a7ba19279/',
        handle: 'priti_i11',
        url: 'https://www.instagram.com/priti_i11/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Gaurish Malhotra',
        linkedin: 'https://www.linkedin.com/in/gaurish-malhotra-sit/',
        handle: 'gaurishmalhotra19',
        url: 'https://www.instagram.com/gaurishmalhotra19/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Anant Soni',
        linkedin: 'https://www.linkedin.com/in/anant-soni-473a92229/',
        handle: 'anantt29',
        url: 'https://www.instagram.com/anantt29/',
        dataStatus: 'link_unverified',
      },
    ];

    expectedRecords.forEach((expected) => {
      const found = INITIAL_PROFILES.find(p => p.name === expected.name);
      assert.ok(found, `Record for ${expected.name} must exist`);
      assert.equal(found.linkedinUrl, expected.linkedin, `LinkedIn mismatch for ${expected.name}`);
      assert.equal(found.instagramHandle, expected.handle, `Instagram handle mismatch for ${expected.name}`);
      assert.equal(found.instagramUrl, expected.url, `Instagram URL mismatch for ${expected.name}`);
      assert.equal(found.dataStatus, expected.dataStatus, `dataStatus mismatch for ${expected.name}`);
      assert.equal(found.participationStatus, 'not_invited', `participationStatus must be 'not_invited' for ${expected.name}`);
      assert.equal(found.approvedPreferences, null, `approvedPreferences must be null for ${expected.name}`);
      assert.equal(found.approvedInterests, null, `approvedInterests must be null for ${expected.name}`);
    });
  });

  test('Criterion 7: Soham Jade handle with wildcard does not generate broken link', () => {
    const soham = INITIAL_PROFILES.find(p => p.name === 'Soham Jade');
    assert.ok(soham);
    assert.equal(soham.instagramHandle, 'soham.*.jade');
    assert.equal(soham.instagramUrl, null);
    assert.equal(soham.dataStatus, 'invalid_format_warning');
  });

  test('Criterion 8: Ethical guardrails — zero inferred preferences', () => {
    INITIAL_PROFILES.forEach(p => {
      assert.equal(p.participationStatus, 'not_invited');
      assert.equal(p.approvedPreferences, null);
      assert.equal(p.approvedInterests, null);
    });
  });

  test('Criterion 5 & 10: ProfileRepository search, filtering, deduplication and dynamic count', () => {
    const repo = new ProfileRepository();
    const all = repo.getAll();
    assert.equal(all.length, 16);

    // Search by name
    const vidhiResults = repo.query({ searchQuery: 'Vidhi' });
    assert.equal(vidhiResults.length, 1);
    assert.equal(vidhiResults[0].name, 'Vidhi Mandovara');

    // Search by handle
    const handleResults = repo.query({ searchQuery: 'iamlabdhi' });
    assert.equal(handleResults.length, 1);
    assert.equal(handleResults[0].name, 'Labdhi Mandovara');

    // Filter by dataStatus
    const formatWarnings = repo.query({ dataStatus: 'invalid_format_warning' });
    assert.equal(formatWarnings.length, 1);
    assert.equal(formatWarnings[0].name, 'Soham Jade');

    // Deduplication check: attempt to add duplicate
    const dupResult = repo.addProfile({
      name: 'Vidhi Mandovara',
      linkedinUrl: 'https://www.linkedin.com/in/vidhi-mandovara/',
    });
    assert.equal(dupResult.success, false, 'Duplicate addition must be rejected');
    assert.match(dupResult.error || '', /Duplicate profile detected/);

    // Non-duplicate candidate addition
    const newAddition = repo.addProfile({
      name: 'Test Candidate One',
      linkedinUrl: 'https://www.linkedin.com/in/test-candidate-one-unique/',
      instagramHandle: 'test_candidate_one',
      sourceUrl: 'https://research-source-one.org',
    });
    assert.equal(newAddition.success, true);
    assert.equal(repo.getAll().length, 17);

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('CompatibilityService: Missing information produces neutral score (never penalized)', () => {
    const compat = new CompatibilityService();
    const [pA, pB] = INITIAL_PROFILES;
    const result = compat.evaluateCompatibility(pA, pB);

    assert.equal(result.humanReviewRequired, true);
    assert.equal(result.missingDataCount, 3);
    assert.equal(result.overallScore, null); // Cannot compute score with 0 approved dimensions
    result.evaluatedDimensions.forEach(dim => {
      assert.equal(dim.approvedDataPresent, false);
      assert.equal(dim.score, null);
    });
  });

  test('ConversationService: All generated dialogue is stamped as AI-generated simulation', () => {
    const conv = new ConversationService();
    const [pA, pB] = INITIAL_PROFILES;
    const session = conv.generateSimulatedPreview(pA, pB);

    assert.match(session.simulatedDisclaimer, /NOTICE: This conversation is entirely AI-generated/);
    assert.ok(session.messages.length > 0);
    session.messages.forEach(msg => {
      assert.equal(msg.isAiGenerated, true);
    });
  });

  test('AgentService: Unenrolled profiles remain uninitialized or awaiting consent', () => {
    const agentService = new AgentService();
    const agent = agentService.getAgentForProfile(INITIAL_PROFILES[0]);
    assert.equal(agent.status, 'awaiting_human_consent');
    assert.equal(agent.authorizedInterests.length, 0);
  });

  // Phase 2 New Requirements Tests
  test('Phase 2: CSV parser handles quotes, commas, and CRLF', () => {
    const sampleCsv = `name,linkedinUrl,instagramHandle,notes\r\n"Doe, John","https://www.linkedin.com/in/johndoe/","johndoe","Note with, comma"\r\nJane Smith,https://www.linkedin.com/in/janesmith/,janesmith,Simple`;
    const parsed = parseCsv(sampleCsv);
    assert.equal(parsed.length, 2);
    assert.equal(parsed[0].name, 'Doe, John');
    assert.equal(parsed[0].notes, 'Note with, comma');
    assert.equal(parsed[1].name, 'Jane Smith');
  });

  test('Phase 2: ImportService maps column aliases (Apify and generic exports)', () => {
    const importService = new ImportService();
    const rawData = [
      {
        fullName: 'Candidate Alpha',
        linkedin: 'https://www.linkedin.com/in/candidate-alpha/',
        instagramUsername: 'cand_alpha',
        sourceUrl: 'https://apify.com/dataset/123',
        description: 'Actor export sample',
      },
    ];

    const repo = new ProfileRepository();
    const analysis = importService.analyzeBatch(rawData, repo.getAll());
    assert.equal(analysis.validRows.length, 1);
    assert.equal(analysis.validRows[0].mappedName, 'Candidate Alpha');
    assert.equal(analysis.validRows[0].mappedLinkedinUrl, 'https://www.linkedin.com/in/candidate-alpha/');
    assert.equal(analysis.validRows[0].mappedInstagramHandle, 'cand_alpha');
    assert.equal(analysis.validRows[0].mappedSourceUrl, 'https://apify.com/dataset/123');
  });

  test('Phase 2: URL & Handle validation rejects malformed URLs and withholds wildcard handles', () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();

    const badRecords = [
      {
        name: 'Bad URL Person',
        linkedinUrl: 'not_a_valid_url',
      },
      {
        name: 'Wildcard Handle Person',
        linkedinUrl: 'https://www.linkedin.com/in/wildcard-person/',
        instagramHandle: 'user.*.wildcard',
      },
    ];

    const analysis = importService.analyzeBatch(badRecords, repo.getAll());
    // The malformed URL should be invalid
    assert.equal(analysis.invalidRows.length, 1);
    assert.match(analysis.invalidRows[0].statusReason, /Malformed LinkedIn URL/);

    // The wildcard handle should be valid, but with URL withheld & invalid_format_warning
    assert.equal(analysis.validRows.length, 1);
    assert.equal(analysis.validRows[0].dataStatus, 'invalid_format_warning');
    assert.equal(analysis.validRows[0].mappedInstagramUrl, null);
  });

  test('Phase 2: Idempotent bulk import prevents duplicates on repeated runs', () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();

    const newBatch = [
      {
        name: 'Batch User 1',
        linkedinUrl: 'https://www.linkedin.com/in/batch-user-1-unique/',
        instagramHandle: 'batch_user_1',
      },
      {
        name: 'Batch User 2',
        linkedinUrl: 'https://www.linkedin.com/in/batch-user-2-unique/',
        instagramHandle: 'batch_user_2',
      },
    ];

    // First analysis: both are valid
    const firstAnalysis = importService.analyzeBatch(newBatch, repo.getAll());
    assert.equal(firstAnalysis.validRows.length, 2);
    assert.equal(firstAnalysis.duplicateRows.length, 0);

    // Commit first batch
    const profiles = importService.convertPreviewsToProfiles(firstAnalysis.validRows);
    const result1 = repo.bulkAddProfiles(profiles);
    assert.equal(result1.addedCount, 2);

    // Second analysis with the SAME batch: both are detected as duplicates!
    const secondAnalysis = importService.analyzeBatch(newBatch, repo.getAll());
    assert.equal(secondAnalysis.validRows.length, 0);
    assert.equal(secondAnalysis.duplicateRows.length, 2);

    // Second bulk add attempt: 0 added
    const profiles2 = importService.convertPreviewsToProfiles(secondAnalysis.validRows);
    const result2 = repo.bulkAddProfiles(profiles2);
    assert.equal(result2.addedCount, 0);

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('Phase 2: Name-only collision is flagged for manual review rather than silently merged', () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();

    // Vidhi Mandovara already exists with specific links
    // Here comes a different person with the same name but different LinkedIn link
    const nameCollisionRow = [
      {
        name: 'Vidhi Mandovara',
        linkedinUrl: 'https://www.linkedin.com/in/vidhi-mandovara-different-profile/',
        instagramHandle: 'vidhi_mandovara_alt',
      },
    ];

    const analysis = importService.analyzeBatch(nameCollisionRow, repo.getAll());
    assert.equal(analysis.conflictRows.length, 1);
    assert.equal(analysis.conflictRows[0].status, 'conflict_requires_review');
    assert.match(analysis.conflictRows[0].statusReason, /matches existing record/);
  });

  test('Phase 2: Imported records enforce safe default statuses', () => {
    const importService = new ImportService();
    const previews = importService.analyzeBatch(
      [{ name: 'Safe Candidate', linkedinUrl: 'https://www.linkedin.com/in/safe-candidate-unique/' }],
      []
    ).validRows;

    const [imported] = importService.convertPreviewsToProfiles(previews);
    assert.equal(imported.participationStatus, 'not_invited');
    assert.equal(imported.approvedPreferences, null);
    assert.equal(imported.approvedInterests, null);
    assert.equal(imported.verification?.identityCorrespondenceConfirmed, false);
  });

  test('Phase 2: CSV Export and Re-Import consistency', () => {
    const repo = new ProfileRepository();
    const all = repo.getAll();
    const csvString = exportToCsv(all);
    assert.ok(csvString.includes('Vidhi Mandovara'));
    assert.ok(csvString.includes('Soham Jade'));

    const reimportedRecords = parseCsv(csvString);
    assert.equal(reimportedRecords.length, 16);
    assert.equal(reimportedRecords[0].name, 'Vidhi Mandovara');
  });

  test('Phase 2: In-place record editing updates fields without duplicate collision', () => {
    const repo = new ProfileRepository();
    const [first] = repo.getAll();

    const updateRes = repo.updateProfile(first.id, {
      notes: 'Updated verification notes during audit.',
      sourceUrl: 'https://audit-trail.example.org',
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.profile?.notes, 'Updated verification notes during audit.');
    assert.equal(updateRes.profile?.sourceUrl, 'https://audit-trail.example.org');

    // Attempting to update another profile to have the first profile's LinkedIn URL should be blocked
    const [p1, p2] = repo.getAll();
    if (p1.linkedinUrl) {
      const collisionUpdate = repo.updateProfile(p2.id, {
        linkedinUrl: p1.linkedinUrl,
      });
      assert.equal(collisionUpdate.success, false);
      assert.match(collisionUpdate.error || '', /already belongs to/);
    }

    // Clean up
    repo.resetToSeedData();
  });

  test('Phase 2: Apify Research Dataset batch parses, deduplicates and expands ledger to 26 records', async () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);

    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const batchFilePath = path.resolve(process.cwd(), 'src/data/apifyResearchBatch.json');
    const rawContent = await fs.readFile(batchFilePath, 'utf-8');

    const parseResult = importService.parseRawInput(rawContent, 'json');
    assert.equal(parseResult.records.length, 10);

    const analysis = importService.analyzeBatch(parseResult.records, repo.getAll());
    assert.equal(analysis.validRows.length, 10);
    assert.equal(analysis.duplicateRows.length, 0);
    assert.equal(analysis.invalidRows.length, 0);

    const newProfiles = importService.convertPreviewsToProfiles(analysis.validRows);
    const summary = repo.bulkAddProfiles(newProfiles);
    assert.equal(summary.addedCount, 10);
    assert.equal(repo.getAll().length, 26, 'Ledger successfully expanded to 26 profiles (>= 25 target)');

    // Ensure all 10 have safe defaults
    const andrew = repo.query({ searchQuery: 'Andrew Ng' })[0];
    assert.ok(andrew);
    assert.equal(andrew.participationStatus, 'not_invited');
    assert.equal(andrew.approvedPreferences, null);
    assert.equal(andrew.sourceUrl, 'https://api.apify.com/v2/datasets/apify_research_batch_02/items');

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('Final Sprint: Peer Cohort Research Batch (10 real peers) integrates and expands ledger to 26 records', async () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);

    const fs = await import('node:fs/promises');
    const path = await import('node:path');
    const cohortPath = path.resolve(process.cwd(), 'src/data/cohortResearchBatch.json');
    const rawContent = await fs.readFile(cohortPath, 'utf-8');

    const parseResult = importService.parseRawInput(rawContent, 'json');
    assert.equal(parseResult.records.length, 10);

    const analysis = importService.analyzeBatch(parseResult.records, repo.getAll());
    assert.equal(analysis.validRows.length, 10);
    assert.equal(analysis.duplicateRows.length, 0);

    const newProfiles = importService.convertPreviewsToProfiles(analysis.validRows);
    const summary = repo.bulkAddProfiles(newProfiles);
    assert.equal(summary.addedCount, 10);
    assert.equal(repo.getAll().length, 26, 'Directory ledger expanded to 26 distinct candidate records');

    // Repeated import must be idempotent (0 added, 10 duplicates)
    const repeatAnalysis = importService.analyzeBatch(parseResult.records, repo.getAll());
    assert.equal(repeatAnalysis.duplicateRows.length, 10);
    assert.equal(repeatAnalysis.validRows.length, 0);

    // Verify cohort records carry safe defaults
    const kaushal = repo.query({ searchQuery: 'Kaushal Vidhani' })[0];
    assert.ok(kaushal);
    assert.equal(kaushal.participationStatus, 'not_invited');
    assert.equal(kaushal.approvedPreferences, null);
    assert.equal(kaushal.approvedInterests, null);

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('Final Sprint: Participant onboarding, explicit consent, and agent calibration', () => {
    const repo = new ProfileRepository();
    const agentService = new AgentService();
    repo.resetToSeedData();

    // Sourced profile begins unconsented
    const vidhi = repo.query({ searchQuery: 'Vidhi Mandovara' })[0];
    assert.equal(vidhi.participationStatus, 'not_invited');
    const unconsentedAgent = agentService.getAgentForProfile(vidhi);
    assert.equal(unconsentedAgent.status, 'awaiting_human_consent');
    assert.equal(unconsentedAgent.authorizedInterests.length, 0);

    // Human participant completes onboarding with approved preferences
    repo.updateProfile(vidhi.id, {
      participationStatus: 'enrolled',
      approvedPreferences: {
        relationshipIntent: 'Long-term partnership',
        communicationStyle: 'Thoughtful asynchronous',
        dealbreakers: ['High-pressure timelines'],
      },
      approvedInterests: ['AI Ethics & Alignment', 'Robotics & Hardware'],
    });

    const enrolled = repo.getById(vidhi.id);
    assert.ok(enrolled);
    assert.equal(enrolled.participationStatus, 'enrolled');

    const calibratedAgent = agentService.getAgentForProfile(enrolled);
    assert.equal(calibratedAgent.status, 'calibrated');
    assert.equal(calibratedAgent.authorizedInterests.length, 2);
    assert.ok(calibratedAgent.authorizedInterests.includes('AI Ethics & Alignment'));

    // Clean up
    repo.resetToSeedData();
  });

  test('Final Sprint: Human approval gates real introductions', () => {
    const consentService = new ConsentService();
    const req = consentService.createApprovalRequest('pA', 'pB', 'High compatibility across shared robotics interest', 85);
    assert.equal(req.status, 'pending_human_review');
    assert.equal(req.channelRevealed, false);

    const approved = consentService.humanApprove(req.id);
    assert.equal(approved.success, true);
    assert.equal(approved.channelRevealed, true);

    const logs = consentService.getAuditLogs();
    const approvalLog = logs.find(l => l.personId === req.id && l.action === 'preferences_approved');
    assert.ok(approvalLog);
    assert.equal(approvalLog.actor, 'user');
  });
});
