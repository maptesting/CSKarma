// Quick script to add test data to your database
// Run with: node test-data.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addTestData() {
  console.log('🔧 Adding test data to database...\n');

  // Create test users
  const testUsers = [
    { steam_id: '76561197960287930', username: 'Gabe_Newell' },
    { steam_id: '76561198000000001', username: 'TestPlayer1' },
    { steam_id: '76561198000000002', username: 'ProGamer' },
    { steam_id: 'baduser', username: 'ToxicTom' },
    { steam_id: 'goodguy', username: 'FriendlyPlayer' }
  ];

  console.log('📝 Creating test users...');
  const createdUsers = [];

  for (const user of testUsers) {
    const { data, error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'steam_id' })
      .select()
      .single();

    if (error) {
      console.log(`   ❌ Error creating ${user.username}:`, error.message);
    } else {
      console.log(`   ✅ Created user: ${user.username} (ID: ${data.id})`);
      createdUsers.push(data);
    }
  }

  console.log('\n🗳️  Creating test votes...');

  // Create some votes for testing
  const votes = [
    // Make "baduser" toxic
    { reporter_idx: 0, target_idx: 3, tag: 'Toxic', comment: 'Very toxic player' },
    { reporter_idx: 1, target_idx: 3, tag: 'Toxic', comment: 'Rude and aggressive' },
    { reporter_idx: 2, target_idx: 3, tag: 'Rager', comment: 'Quit mid-game' },
    { reporter_idx: 0, target_idx: 3, tag: 'Toxic', comment: null },
    { reporter_idx: 1, target_idx: 3, tag: 'Toxic', comment: null },

    // Make "goodguy" helpful
    { reporter_idx: 0, target_idx: 4, tag: 'Helpful', comment: 'Great teammate!' },
    { reporter_idx: 1, target_idx: 4, tag: 'Helpful', comment: 'Very friendly' },
    { reporter_idx: 2, target_idx: 4, tag: 'Helpful', comment: 'Good comms' },

    // Give Gabe Newell some votes
    { reporter_idx: 1, target_idx: 0, tag: 'Helpful', comment: 'Created Steam!' },
    { reporter_idx: 2, target_idx: 0, tag: 'Helpful', comment: 'Legend' },
  ];

  for (const vote of votes) {
    if (createdUsers[vote.reporter_idx] && createdUsers[vote.target_idx]) {
      const { error } = await supabase
        .from('votes')
        .insert({
          reporter_id: createdUsers[vote.reporter_idx].id,
          target_id: createdUsers[vote.target_idx].id,
          match_id: `/test/match/${Date.now()}`,
          tag: vote.tag,
          optional_comment: vote.comment
        });

      if (error) {
        console.log(`   ❌ Error creating vote:`, error.message);
      } else {
        console.log(`   ✅ ${createdUsers[vote.reporter_idx].username} → ${createdUsers[vote.target_idx].username}: ${vote.tag}`);
      }
    }
  }

  console.log('\n✅ Test data added successfully!\n');
  console.log('🔍 Try searching for these users:');
  console.log('   - "baduser" (should show low vibe score)');
  console.log('   - "goodguy" (should show high vibe score)');
  console.log('   - "76561197960287930" (Gabe Newell)');
  console.log('\n💡 Visit: http://localhost:3000/search');
}

addTestData().catch(console.error);
