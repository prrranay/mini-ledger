"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/currency";
import { Trash2, Search, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EditTransactionModal } from "@/components/transactions/edit-transaction-modal";
import { DeleteConfirmModal } from "@/components/transactions/delete-confirm-modal";
import { Category, TransactionType } from "@prisma/client";

export default function TransactionsPage() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("ALL");
  const [category, setCategory] = useState<string>("ALL");
  const queryClient = useQueryClient();

  // State for Edit Modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTransactionForEdit, setSelectedTransactionForEdit] = useState<any>(null);

  // State for Delete Modal
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedTransactionForDelete, setSelectedTransactionForDelete] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["transactions", search, type, category],
    queryFn: async () => {
      let url = `/api/transactions?search=${search}`;
      if (type !== "ALL") url += `&type=${type}`;
      if (category !== "ALL") url += `&category=${category}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete transaction");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Transaction deleted");
      setIsDeleteOpen(false);
    },
    onError: () => {
      toast.error("Failed to delete transaction");
    }
  });

  const handleEditClick = (transaction: any) => {
    setSelectedTransactionForEdit(transaction);
    setIsEditOpen(true);
  };

  const handleDeleteClick = (transaction: any) => {
    setSelectedTransactionForDelete(transaction);
    setIsDeleteOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedTransactionForDelete) {
      deleteMutation.mutate(selectedTransactionForDelete.id);
    }
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select value={type} onValueChange={(val) => setType(val || "ALL")}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
            </SelectContent>
          </Select>

          <Select value={category} onValueChange={(val) => setCategory(val || "ALL")}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {Object.values(Category).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat.charAt(0) + cat.slice(1).toLowerCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {(type !== "ALL" || category !== "ALL" || search !== "") && (
            <Button variant="ghost" onClick={() => { setType("ALL"); setCategory("ALL"); setSearch(""); }} size="sm">
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden w-full">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-[600px] md:min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead className="w-[100px] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : data?.transactions?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                data?.transactions?.map((transaction: any) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{format(new Date(transaction.date), "MMM d, yyyy")}</TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">{transaction.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className={`text-right font-medium ${transaction.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {transaction.type === 'INCOME' ? '+' : '-'}{formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                        onClick={() => handleEditClick(transaction)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-muted-foreground hover:text-destructive h-8 w-8"
                        onClick={() => handleDeleteClick(transaction)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <EditTransactionModal 
        open={isEditOpen} 
        onOpenChange={setIsEditOpen} 
        transaction={selectedTransactionForEdit}
      />

      <DeleteConfirmModal 
        open={isDeleteOpen} 
        onOpenChange={setIsDeleteOpen} 
        onConfirm={handleConfirmDelete}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
}
