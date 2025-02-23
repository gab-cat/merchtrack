import { Metadata } from "next";
import { SurveyCategoriesList } from "./components/survey-categories-list";
import { SurveyResponsesList } from "./components/survey-responses-list";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageAnimation from "@/components/public/page-animation";
import PageTitle from "@/components/private/page-title";

export const metadata: Metadata = {
  title: "Survey | MerchTrack",
  description: "Process and manage order payments",
};


export default function SurveyPage() {


  return (
    <PageAnimation>
      <div className="p-6">
        <PageTitle title="Survey Management" />
        
        <div className="mt-6">
          <Tabs defaultValue="categories">
            <TabsList className="space-x-4">
              <TabsTrigger value="categories">Survey Categories</TabsTrigger>
              <TabsTrigger value="responses">Survey Responses</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="mt-4">
              <SurveyCategoriesList />
            </TabsContent>

            <TabsContent value="responses" className="mt-4">
              <SurveyResponsesList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageAnimation>
  );
}