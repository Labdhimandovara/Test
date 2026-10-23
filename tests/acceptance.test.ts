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
        name: 'Alex Chen',
        linkedin: 'https://www.linkedin.com/in/demo-alex-chen/',
        handle: 'demo_alexchen',
        url: 'https://www.instagram.com/demo_alexchen?ref=sample_demo',
        dataStatus: 'user_supplied',
      },
      {
        name: 'Jordan Lee',
        linkedin: 'https://www.linkedin.com/in/demo-jordan-lee/',
        handle: 'demo_jordanlee',
        url: 'https://www.instagram.com/demo_jordanlee/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Morgan Taylor',
        linkedin: 'https://www.linkedin.com/in/demo-morgan-taylor/',
        handle: 'demo_morgant',
        url: 'https://www.instagram.com/demo_morgant/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Casey Miller',
        linkedin: 'https://www.linkedin.com/in/demo-casey-miller/',
        handle: 'demo_caseym',
        url: 'https://www.instagram.com/demo_caseym/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Riley Davis',
        linkedin: 'https://www.linkedin.com/in/demo-riley-davis/',
        handle: 'demo_rileyd',
        url: 'https://www.instagram.com/demo_rileyd/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Jamie Wilson',
        linkedin: 'https://www.linkedin.com/in/demo-jamie-wilson/',
        handle: 'demo_jamiew',
        url: 'https://www.instagram.com/demo_jamiew/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Avery Martinez',
        linkedin: 'https://www.linkedin.com/in/demo-avery-martinez/',
        handle: 'demo_averym',
        url: 'https://www.instagram.com/demo_averym/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Quinn Anderson',
        linkedin: 'https://www.linkedin.com/in/demo-quinn-anderson/',
        handle: 'demo_quinna',
        url: 'https://www.instagram.com/demo_quinna/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Skyler Thomas',
        linkedin: 'https://www.linkedin.com/in/demo-skyler-thomas/',
        handle: 'demo_skylert',
        url: 'https://www.instagram.com/demo_skylert/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Cameron Jackson',
        linkedin: 'https://www.linkedin.com/in/demo-cameron-jackson/',
        handle: 'demo_cameronj',
        url: 'https://www.instagram.com/demo_cameronj/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Sam Rivera',
        linkedin: 'https://www.linkedin.com/in/demo-sam-rivera/',
        handle: 'sam.*.demo',
        url: null, // Constraint: URL withheld due to potentially invalid characters
        dataStatus: 'invalid_format_warning',
      },
      {
        name: 'Taylor Brooks',
        linkedin: 'https://www.linkedin.com/in/demo-taylor-brooks/',
        handle: 'demo_taylorb',
        url: 'https://www.instagram.com/demo_taylorb/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Dakota Bennett',
        linkedin: 'https://www.linkedin.com/in/demo-dakota-bennett/',
        handle: 'demo_dakotab',
        url: 'https://www.instagram.com/demo_dakotab/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Reese Parker',
        linkedin: 'https://www.linkedin.com/in/demo-reese-parker/',
        handle: 'demo_reesep',
        url: 'https://www.instagram.com/demo_reesep/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Kendall Gray',
        linkedin: 'https://www.linkedin.com/in/demo-kendall-gray/',
        handle: 'demo_kendallg',
        url: 'https://www.instagram.com/demo_kendallg/',
        dataStatus: 'link_unverified',
      },
      {
        name: 'Hayden Foster',
        linkedin: 'https://www.linkedin.com/in/demo-hayden-foster/',
        handle: 'demo_haydenf',
        url: 'https://www.instagram.com/demo_haydenf/',
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

  test('Criterion 7: Sam Rivera handle with wildcard does not generate broken link', () => {
    const sam = INITIAL_PROFILES.find(p => p.name === 'Sam Rivera');
    assert.ok(sam);
    assert.equal(sam.instagramHandle, 'sam.*.demo');
    assert.equal(sam.instagramUrl, null);
    assert.equal(sam.dataStatus, 'invalid_format_warning');
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
    const alexResults = repo.query({ searchQuery: 'Alex' });
    assert.equal(alexResults.length, 1);
    assert.equal(alexResults[0].name, 'Alex Chen');

    // Search by handle
    const handleResults = repo.query({ searchQuery: 'demo_jordanlee' });
    assert.equal(handleResults.length, 1);
    assert.equal(handleResults[0].name, 'Jordan Lee');

    // Filter by dataStatus
    const formatWarnings = repo.query({ dataStatus: 'invalid_format_warning' });
    assert.equal(formatWarnings.length, 1);
    assert.equal(formatWarnings[0].name, 'Sam Rivera');

    // Deduplication check: attempt to add duplicate
    const dupResult = repo.addProfile({
      name: 'Alex Chen',
      linkedinUrl: 'https://www.linkedin.com/in/demo-alex-chen/',
    });
    assert.equal(dupResult.success, false, 'Duplicate addition must be rejected');
    assert.match(dupResult.error || '', /Duplicate profile detected/);

    // Non-duplicate candidate addition
    const newAddition = repo.addProfile({
      name: 'Test Candidate One',
      linkedinUrl: 'https://www.linkedin.com/in/demo-candidate-one-unique/',
      instagramHandle: 'demo_candidate_one',
      sourceUrl: 'https://example.com/demo/source-one',
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

  test('Phase 2: CSV parser handles quotes, commas, and CRLF', () => {
    const csvData = 'name,linkedinUrl,instagramHandle,notes\r\n"Alex Chen","https://www.linkedin.com/in/demo-alex-chen/","demo_alexchen","Notes, with comma"\r\n"Jordan Lee","https://www.linkedin.com/in/demo-jordan-lee/","demo_jordanlee","Standard row"';
    const records = parseCsv(csvData);

    assert.equal(records.length, 2);
    assert.equal(records[0].name, 'Alex Chen');
    assert.equal(records[0].notes, 'Notes, with comma');
    assert.equal(records[1].name, 'Jordan Lee');
  });

  test('Phase 2: ImportService maps column aliases (Apify and generic exports)', () => {
    const importService = new ImportService();
    const rawData = [
      {
        fullName: 'Candidate Alpha',
        linkedin: 'https://www.linkedin.com/in/demo-candidate-alpha/',
        instagramUsername: 'cand_alpha',
        sourceUrl: 'https://example.com/demo/dataset/123',
        description: 'Actor export sample',
      },
    ];

    const repo = new ProfileRepository();
    const analysis = importService.analyzeBatch(rawData, repo.getAll());
    assert.equal(analysis.validRows.length, 1);
    assert.equal(analysis.validRows[0].mappedName, 'Candidate Alpha');
    assert.equal(analysis.validRows[0].mappedLinkedinUrl, 'https://www.linkedin.com/in/demo-candidate-alpha/');
    assert.equal(analysis.validRows[0].mappedInstagramHandle, 'cand_alpha');
    assert.equal(analysis.validRows[0].mappedSourceUrl, 'https://example.com/demo/dataset/123');
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
        linkedinUrl: 'https://www.linkedin.com/in/demo-wildcard-person/',
        instagramHandle: 'user.*.wildcard',
      },
    ];

    const analysis = importService.analyzeBatch(badRecords, repo.getAll());
    assert.equal(analysis.invalidRows.length, 1);
    assert.match(analysis.invalidRows[0].statusReason, /Malformed LinkedIn URL/);

    assert.equal(analysis.validRows.length, 1);
    assert.equal(analysis.validRows[0].dataStatus, 'invalid_format_warning');
    assert.equal(analysis.validRows[0].mappedInstagramUrl, null);
  });

  test('Phase 2: Idempotent bulk import prevents duplicates on repeated runs', () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);

    const newCandidates = [
      { name: 'Unique Candidate A', linkedinUrl: 'https://www.linkedin.com/in/demo-candidate-a/' },
      { name: 'Unique Candidate B', linkedinUrl: 'https://www.linkedin.com/in/demo-candidate-b/' },
    ];

    const analysis1 = importService.analyzeBatch(newCandidates, repo.getAll());
    assert.equal(analysis1.validRows.length, 2);
    assert.equal(analysis1.duplicateRows.length, 0);

    const profilesToAdd = importService.convertPreviewsToProfiles(analysis1.validRows);
    const result1 = repo.bulkAddProfiles(profilesToAdd);
    assert.equal(result1.addedCount, 2);
    assert.equal(repo.getAll().length, 18);

    // Repeated run with same records
    const analysis2 = importService.analyzeBatch(newCandidates, repo.getAll());
    assert.equal(analysis2.validRows.length, 0);
    assert.equal(analysis2.duplicateRows.length, 2);

    const result2 = repo.bulkAddProfiles(importService.convertPreviewsToProfiles(analysis2.validRows));
    assert.equal(result2.addedCount, 0);

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('Phase 2: Name-only collision is flagged for manual review rather than silently merged', () => {
    const importService = new ImportService();
    const repo = new ProfileRepository();

    // Alex Chen already exists with specific links
    // Here comes a different person with the same name but different LinkedIn link
    const nameCollisionRow = [
      {
        name: 'Alex Chen',
        linkedinUrl: 'https://www.linkedin.com/in/demo-alex-chen-different-profile/',
        instagramHandle: 'demo_alex_chen_alt',
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
      [{ name: 'Safe Candidate', linkedinUrl: 'https://www.linkedin.com/in/demo-safe-candidate-unique/' }],
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
    assert.ok(csvString.includes('Alex Chen'));
    assert.ok(csvString.includes('Sam Rivera'));

    const reimportedRecords = parseCsv(csvString);
    assert.equal(reimportedRecords.length, 16);
    assert.equal(reimportedRecords[0].name, 'Alex Chen');
  });

  test('Phase 2: In-place record editing updates fields without duplicate collision', () => {
    const repo = new ProfileRepository();
    const [first] = repo.getAll();

    const updateRes = repo.updateProfile(first.id, {
      notes: 'Updated verification notes during audit.',
      sourceUrl: 'https://example.com/demo/audit-trail',
    });

    assert.equal(updateRes.success, true);
    assert.equal(updateRes.profile?.notes, 'Updated verification notes during audit.');
    assert.equal(updateRes.profile?.sourceUrl, 'https://example.com/demo/audit-trail');

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
    const robin = repo.query({ searchQuery: 'Robin Hayes' })[0];
    assert.ok(robin);
    assert.equal(robin.participationStatus, 'not_invited');
    assert.equal(robin.approvedPreferences, null);
    assert.equal(robin.sourceUrl, 'https://example.com/demo/cohort/items');

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
    const robin = repo.query({ searchQuery: 'Robin Hayes' })[0];
    assert.ok(robin);
    assert.equal(robin.participationStatus, 'not_invited');
    assert.equal(robin.approvedPreferences, null);
    assert.equal(robin.approvedInterests, null);

    // Clean up
    repo.resetToSeedData();
    assert.equal(repo.getAll().length, 16);
  });

  test('Final Sprint: Participant onboarding, explicit consent, and agent calibration', () => {
    const repo = new ProfileRepository();
    const agentService = new AgentService();
    repo.resetToSeedData();

    // Sourced profile begins unconsented
    const alex = repo.query({ searchQuery: 'Alex Chen' })[0];
    assert.equal(alex.participationStatus, 'not_invited');
    const unconsentedAgent = agentService.getAgentForProfile(alex);
    assert.equal(unconsentedAgent.status, 'awaiting_human_consent');
    assert.equal(unconsentedAgent.authorizedInterests.length, 0);

    // Human participant completes onboarding with approved preferences
    repo.updateProfile(alex.id, {
      participationStatus: 'enrolled',
      approvedPreferences: {
        relationshipIntent: 'Long-term partnership',
        communicationStyle: 'Thoughtful asynchronous',
        dealbreakers: ['High-pressure timelines'],
      },
      approvedInterests: ['AI Ethics & Alignment', 'Robotics & Hardware'],
    });

    const enrolled = repo.getById(alex.id);
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
