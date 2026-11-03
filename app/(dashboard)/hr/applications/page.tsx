import { getHRApplicationsAction } from "@/src/actions/application.actions"
import { ApplicationsTableClient } from "@/components/dashboard/ApplicationsTableClient"
import { redirect } from "next/navigation"

export const revalidate = 0

export default async function HRApplicationsPage() {
  const response = await getHRApplicationsAction()

  if (!response.success) {
    if (response.code === "UNAUTHORIZED" || response.code === "TOKEN_EXPIRED") {
      redirect("/login")
    }
    throw new Error("Failed to load applications")
  }

  const applications = response.applications || []

  return <ApplicationsTableClient initialApplications={applications} />
}
