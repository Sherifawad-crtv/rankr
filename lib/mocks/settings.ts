import type {
  CompanySettings,
  NotificationPreferences,
  TeamMember,
  UserProfile,
} from "@/types";

export const mockSettings: {
  profile: UserProfile;
  company: CompanySettings;
  team: TeamMember[];
  notifications: NotificationPreferences;
} = {
  profile: { fullName: "Mock Recruiter", jobTitle: "HR Manager", email: "recruiter@example.com" },
  company: {
    name: "Acme Talent",
    size: "51-200",
    branding: { name: "Acme Talent", logoUrl: null, primaryColor: "#2563EB" },
  },
  team: [
    { id: "m1", name: "Mock Admin", email: "admin@example.com", role: "company_admin", status: "active" },
    { id: "m2", name: "Mock Recruiter", email: "recruiter@example.com", role: "recruiter", status: "active" },
    { id: "m3", name: "Sara Mostafa", email: "sara.mostafa@example.com", role: "recruiter", status: "active" },
    { id: "m4", name: "nour@example.com", email: "nour@example.com", role: "recruiter", status: "invited" },
  ],
  notifications: { runCompleted: true, productTips: false },
};
