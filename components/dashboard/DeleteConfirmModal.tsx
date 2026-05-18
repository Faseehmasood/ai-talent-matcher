"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, AlertTriangle } from "lucide-react"


interface DeleteConfirmProps {
  itemName: string;     
  onDelete: () => void; 
}

export function DeleteConfirmModal({ itemName, onDelete }: DeleteConfirmProps) {
  return (
    <Dialog>
      
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition-all">
          <Trash2 className="w-4 h-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-border shadow-2xl p-6">
        <DialogHeader className="flex flex-col items-center justify-center text-center space-y-3">
          
          <div className="w-16 h-16 bg-red-100 rounded-3xl flex items-center justify-center mb-2">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          
          <DialogTitle className="text-2xl font-black tracking-tight text-foreground">
            Are you sure?
          </DialogTitle>
          
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            You are about to permanently delete <br />
            <span className="font-bold text-red-600 underline decoration-red-200 underline-offset-4">
              {itemName}
            </span>. <br />
            This action is irreversible.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="grid grid-cols-2 gap-3 mt-6">
          
          <Button 
            variant="outline" 
            className="rounded-xl h-11 font-bold border-border hover:bg-muted"
          >
            No, Cancel
          </Button>

          
          <Button 
            variant="destructive" 
            className="rounded-xl h-11 font-bold shadow-lg shadow-red-500/20"
            onClick={onDelete} 
          >
            Yes, Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}