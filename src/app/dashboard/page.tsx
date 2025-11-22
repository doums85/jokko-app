"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, authClient } from "@/lib/auth-client";

interface Organization {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/sign-in");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    const fetchOrganizations = async () => {
      if (session?.user?.id) {
        try {
          const response = await fetch("/api/organizations");
          if (response.ok) {
            const data = await response.json();
            setOrganizations(data.organizations || []);
          }
        } catch (error) {
          console.error("Error fetching organizations:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchOrganizations();
  }, [session]);

  const handleSignOut = async () => {
    await authClient.signOut();
    // Small delay to ensure signOut completes before redirect
    await new Promise(resolve => setTimeout(resolve, 200));
    window.location.href = "/sign-in"; // Use full page reload to ensure session is cleared
  };

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                {session.user?.name || session.user?.email}
              </span>
              <button
                onClick={handleSignOut}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Bienvenue, {session.user?.name || "Utilisateur"} !
            </h2>
            <p className="text-gray-600 mb-6">
              Votre compte a été créé avec succès.
            </p>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Vos organisations
              </h3>
              {isLoading ? (
                <p className="text-gray-600">Chargement des organisations...</p>
              ) : organizations.length > 0 ? (
                <div className="space-y-4">
                  {organizations.map((org) => (
                    <div
                      key={org.id}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{org.name}</h4>
                          <p className="text-sm text-gray-600">/{org.slug}</p>
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {org.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  Aucune organisation trouvée. Veuillez contacter le support.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
