const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

// Collection name mapping (LowDB table names → Supabase table names)
const COLLECTION_MAP = {
  users: 'users',
  jadwal_sholat: 'jadwal_sholat',
  kajian: 'kajian',
  keuangan: 'keuangan',
  agenda: 'agenda',
  running_text: 'running_text',
  settings: 'settings',
  audit_log: 'audit_log',
  laporan: 'laporan'
};

// Helper functions (same interface as LowDB version)
const dbHelpers = {
  async findAll(collection) {
    const table = COLLECTION_MAP[collection] || collection;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching ${collection}:`, error.message);
      return [];
    }
    return data || [];
  },

  async findById(collection, id) {
    const table = COLLECTION_MAP[collection] || collection;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      console.error(`Error fetching ${collection} by id:`, error.message);
      return null;
    }
    return data;
  },

  async findWhere(collection, predicate) {
    const table = COLLECTION_MAP[collection] || collection;
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) {
      console.error(`Error fetching ${collection}:`, error.message);
      return [];
    }
    return (data || []).filter(predicate);
  },

  async findOneWhere(collection, predicate) {
    const table = COLLECTION_MAP[collection] || collection;
    const { data, error } = await supabase
      .from(table)
      .select('*');

    if (error) {
      console.error(`Error fetching ${collection}:`, error.message);
      return null;
    }
    return (data || []).find(predicate);
  },

  async insert(collection, data) {
    const table = COLLECTION_MAP[collection] || collection;
    const insertData = {
      ...data,
      created_at: new Date().toISOString()
    };

    // Remove id if null (let Supabase generate UUID)
    if (!insertData.id) delete insertData.id;

    const { data: result, error } = await supabase
      .from(table)
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error(`Error inserting into ${collection}:`, error.message);
      throw error;
    }
    return result;
  },

  async update(collection, id, data) {
    const table = COLLECTION_MAP[collection] || collection;
    const updateData = { ...data };

    // Remove id from update data
    delete updateData.id;

    const { data: result, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(`Error updating ${collection}:`, error.message);
      throw error;
    }
    return result;
  },

  async remove(collection, id) {
    const table = COLLECTION_MAP[collection] || collection;
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) {
      console.error(`Error deleting from ${collection}:`, error.message);
      throw error;
    }
    return true;
  },

  async count(collection) {
    const table = COLLECTION_MAP[collection] || collection;
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error(`Error counting ${collection}:`, error.message);
      return 0;
    }
    return count || 0;
  }
};

// Export supabase client for direct queries if needed
module.exports = { supabase, dbHelpers };
