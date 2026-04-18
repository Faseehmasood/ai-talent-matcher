"use client"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"

export function DeleteConfirmModal({ itemName, onDelete }: { itemName: string, onDelete: () => void }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] rounded-3xl">
        <DialogHeader className="flex flex-col items-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <DialogTitle>Are you absolutely sure?</DialogTitle>
          <DialogDescription className="text-center">
            You are about to delete <span className="font-bold text-foreground">"{itemName}"</span>. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="grid grid-cols-2 gap-2 mt-4">
          <Button variant="outline" className="rounded-xl">Cancel</Button>
          <Button variant="destructive" className="rounded-xl" onClick={onDelete}>Delete Now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}