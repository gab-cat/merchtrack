import { SurveyClient } from "./components/survey-client";

type SurveyPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export const metadata = {
  title: "Survey | MerchTrack",
  description: "We value your feedback and want to ensure the best experience. Please take a moment to complete our survey.",
};

export default async function SurveyPage({ searchParams }: Readonly<SurveyPageProps>) {
  const { id } = await searchParams;
  const surveyId = id as string | undefined;
  
  return <SurveyClient surveyId={surveyId} />;
};