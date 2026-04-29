import { supabase } from './src/integrations/supabase/client.js';

// Test Supabase connection and donation form submission
async function testDonationSubmission() {
  console.log('Testing Supabase connection...');

  try {
    // Test basic connection
    const { data, error } = await supabase.from('donation_leads').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return;
    }
    console.log('Supabase connection successful');

    // Test donation submission
    const testData = {
      full_name: 'Test User',
      email: 'test@example.com',
      donation_type: 'Individual',
      amount: 100,
      currency: 'USD',
      contact_method: 'Email',
      status: 'New'
    };

    console.log('Submitting test donation...');
    const { data: insertData, error: insertError } = await supabase
      .from('donation_leads')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('Donation submission error:', insertError);
      return;
    }

    console.log('Donation submitted successfully:', insertData);

    // Clean up test data
    if (insertData && insertData[0]) {
      await supabase.from('donation_leads').delete().eq('id', insertData[0].id);
      console.log('Test data cleaned up');
    }

  } catch (error) {
    console.error('Test failed:', error);
  }
}

testDonationSubmission();