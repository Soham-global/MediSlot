import { UsersRound } from "lucide-react";
import AdminPlaceholder from "./AdminPlaceholder";

export default function AdminDoctorsPage() {
  return (
    <AdminPlaceholder
      icon={UsersRound}
      title="Manage doctors"
      description="Doctor profiles, department assignments, availability status, and care team management will live here."
    />
  );
}
