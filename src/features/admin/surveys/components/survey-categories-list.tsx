'use client';

import { useState } from "react";
import { useDebounce } from "use-debounce";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { SurveyCategory } from "@prisma/client";
import { SurveyCategoryForm, SurveyCategorySkeleton } from ".";
import { PaginationFooter } from "@/components/shared/pagination-footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useUserStore } from "@/stores/user.store";
import useToast from "@/hooks/use-toast";
import type { CreateSurveyCategoryType } from "@/features/admin/surveys/survey.schema";
import { useSurveyCategoriesQuery } from "@/hooks/survey.hooks";
import type { QueryParams } from "@/types/common";
import { deleteSurveyCategory } from "@/features/admin/surveys/actions";

const ITEMS_PER_PAGE = 10;

export function SurveyCategoriesList() {
  const { userId } = useUserStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [debouncedSearch] = useDebounce(searchTerm, 1000);
  const [selectedCategory, setSelectedCategory] = useState<(CreateSurveyCategoryType & { id: string }) | null>(null);

  const queryParams: QueryParams = {
    take: ITEMS_PER_PAGE,
    skip: (currentPage - 1) * ITEMS_PER_PAGE,
    page: currentPage,
    where: debouncedSearch ? {
      OR: [
        { name: { contains: debouncedSearch, mode: 'insensitive' } },
        { description: { contains: debouncedSearch, mode: 'insensitive' } }
      ],
      isDeleted: false
    } : {
      isDeleted: false
    }
  };

  const { data: response, isLoading, refetch } = useSurveyCategoriesQuery(queryParams);
  const categories = response?.data ?? [];
  const totalPages = response?.metadata ? Math.ceil(response.metadata.total / ITEMS_PER_PAGE) : 0;

  const handleDelete = async (id: string) => {
    const response = await deleteSurveyCategory({
      userId: userId as string,
      id
    });

    if (response.success) {
      useToast({
        type: "success",
        title: "Success",
        message: "Survey category deleted"
      });
      refetch();
    } else {
      useToast({
        type: "error",
        title: "Error",
        message: response.message ?? "Failed to delete survey category"
      });
    }
  };

  const transformCategory = (category: SurveyCategory) => ({
    id: category.id,
    name: category.name,
    description: category.description ?? undefined,
    question1: category.question1,
    question2: category.question2,
    question3: category.question3,
    question4: category.question4
  });

  const renderCategoryRow = (category: SurveyCategory) => (
    <TableRow key={category.id}>
      <TableCell>{category.name}</TableCell>
      <TableCell>{category.description ?? "N/A"}</TableCell>
      <TableCell>
        <ul className="list-inside list-disc">
          <li>{category.question1}</li>
          <li>{category.question2}</li>
          <li>{category.question3}</li>
          <li>{category.question4}</li>
        </ul>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setSelectedCategory(transformCategory(category))}
              >
                <Pencil className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogTitle hidden>Edit Category</DialogTitle>
            <DialogContent>
              <SurveyCategoryForm
                initialData={selectedCategory ?? undefined}
                onSuccess={() => {
                  setSelectedCategory(null);
                  refetch();
                }}
              />
            </DialogContent>
          </Dialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="size-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the survey category.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => handleDelete(category.id)}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Survey Categories</CardTitle>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="size-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <SurveyCategoryForm onSuccess={refetch} />
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <SurveyCategorySkeleton />
            ) : !categories.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-8 text-center">
                  No survey categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map(renderCategoryRow)
            )}
          </TableBody>
        </Table>

        <PaginationFooter 
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={response?.metadata?.total ?? 0}
          itemsPerPage={ITEMS_PER_PAGE}
          onPageChange={setCurrentPage}
        />
      </CardContent>
    </Card>
  );
}