import { useEffect, useState } from 'react';
import { Download, Award, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { Certificate } from '../lib/supabase';

export default function CertificatesPage() {
  const { profile } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    const fetchData = async () => {
      const { data } = await supabase
        .from('certificates')
        .select('*, course:courses(*)')
        .eq('user_id', profile.id)
        .order('issued_at', { ascending: false });
      setCertificates(data as Certificate[] ?? []);
      setLoading(false);
    };
    fetchData();
  }, [profile]);

  if (loading) {
    return <div className="container-app py-20"><div className="card h-96 animate-pulse bg-neutral-200 dark:bg-neutral-800" /></div>;
  }

  return (
    <div className="container-app py-8 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Certificates</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">Your earned certificates for completed courses.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="card p-12 text-center">
          <Award className="mx-auto h-12 w-12 text-neutral-400" />
          <p className="mt-4 text-lg font-medium">No certificates yet</p>
          <p className="mt-1 text-sm text-neutral-500">Complete a course to earn your first certificate.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {certificates.map((cert, i) => (
            <div
              key={cert.id}
              className="card overflow-hidden animate-fade-in-up"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="relative bg-gradient-to-br from-primary-600 to-primary-800 p-6 text-white">
                <div className="absolute inset-0 grid-pattern opacity-20" />
                <div className="relative">
                  <Award className="h-10 w-10 text-accent-300" />
                  <p className="mt-3 text-xs uppercase tracking-wider text-primary-100">Certificate of Completion</p>
                  <h3 className="mt-1 text-xl font-bold">{cert.course?.title}</h3>
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Certificate Number</p>
                    <p className="font-mono text-sm font-medium">{cert.certificate_number}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-neutral-500">Issued</p>
                    <p className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(cert.issued_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button className="btn-secondary mt-4 w-full">
                  <Download className="h-4 w-4" /> Download Certificate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
