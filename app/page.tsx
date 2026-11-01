import { getPublicJobsAction } from "@/src/actions/job.actions"
import HomeClient from "@/app/_components/HomeClient"

export default async function Home() {
  const { jobs } = await getPublicJobsAction()
  return <HomeClient jobs={jobs || []} />
}
