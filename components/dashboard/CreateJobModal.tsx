"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"

export function CreateJobModal() {
  return (
    <Dialog>
      {/* 1. Button jo Modal ko khole ga */}
      <DialogTrigger asChild>
        <Button className="gap-2 rounded-xl">
          <PlusCircle className="w-4 h-4" />
          Create Job
        </Button>
      </DialogTrigger>

      {/* 2. Modal ka Content */}
      <DialogContent className="sm:max-w-[600px] rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Post a New Job</DialogTitle>
          <DialogDescription>
            Fill in the details below to attract the best candidates.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          {/* Job Title & Company */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" placeholder="e.g. Senior React Developer" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company Name</Label>
              <Input id="company" placeholder="e.g. Tech Solutions" className="rounded-xl" />
            </div>
          </div>

          {/* Location & Job Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" placeholder="e.g. Karachi, PK or Remote" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring">
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Salary Range */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="minSalary">Min Salary</Label>
              <Input id="minSalary" type="number" placeholder="50000" className="rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxSalary">Max Salary</Label>
              <Input id="maxSalary" type="number" placeholder="80000" className="rounded-xl" />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the roles and responsibilities..." 
              className="rounded-xl min-h-[100px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-xl">Cancel</Button>
          <Button type="submit" className="rounded-xl px-8">Post Job</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}