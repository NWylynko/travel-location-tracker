"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Trash2Icon } from "lucide-react";

type HolidayEntry = {
  id: string;
  year: string;
  month: string;
  location: string;
};

export function HolidayTrackerComponent() {
  const { toast } = useToast();
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [location, setLocation] = useState("");
  const [entries, setEntries] = useState<HolidayEntry[]>([]);

  useEffect(() => {
    const storedEntries = localStorage.getItem("holidayEntries");
    if (storedEntries) {
      setEntries(JSON.parse(storedEntries));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("holidayEntries", JSON.stringify(entries));
  }, [entries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (year && month && location) {
      const newEntry: HolidayEntry = {
        id: Date.now().toString(),
        year,
        month,
        location,
      };
      setEntries([newEntry, ...entries]);
      setYear("");
      setMonth("");
      setLocation("");
      toast({
        title: "Holiday added",
        description: `Your trip to ${location} has been added.`,
      });
    }
  };

  const saveToFile = () => {
    try {
      // Create blob from the entries data
      const blob = new Blob([JSON.stringify(entries, null, 2)], {
        type: "application/json",
      });

      // Create a download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "holiday-entries.json";

      // Programmatically click the link to trigger download
      document.body.appendChild(link);
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "File saved",
        description: "Your holiday entries have been saved to a file.",
      });
    } catch (error) {
      console.error("Error saving file:", error);
      toast({
        title: "Error",
        description: "There was an error saving the file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const loadFromFile = () => {
    return new Promise<void>((resolve) => {
      try {
        // Create file input
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".json,application/json";

        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (!file) return;

          try {
            const contents = await file.text();
            const loadedEntries = JSON.parse(contents);
            setEntries(loadedEntries);

            toast({
              title: "File loaded",
              description: "Your holiday entries have been loaded from the file.",
            });
            resolve();
          } catch (error) {
            console.error("Error reading file:", error);
            toast({
              title: "Error",
              description: "There was an error reading the file. Please try again.",
              variant: "destructive",
            });
          }
        };

        // Trigger file picker
        input.click();
      } catch (error) {
        console.error("Error loading file:", error);
        toast({
          title: "Error",
          description: "There was an error loading the file. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  const deleteEntry = (id: string, location: string) => {
    if (window.confirm(`Are you sure you want to delete your holiday to ${location}?`)) {
      setEntries(entries.filter((entry) => entry.id !== id));
      toast({
        title: "Holiday deleted",
        description: `Your trip to ${location} has been removed.`,
      });
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-none shadow-none">
      <CardHeader>
        <CardTitle>Holiday Tracker</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                min="1900"
                max="2099"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="month">Month</Label>
              <Select value={month} onValueChange={setMonth} required>
                <SelectTrigger id="month">
                  <SelectValue placeholder="Select month" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "January",
                    "February",
                    "March",
                    "April",
                    "May",
                    "June",
                    "July",
                    "August",
                    "September",
                    "October",
                    "November",
                    "December",
                  ].map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full">
            Add Holiday
          </Button>
        </form>
        <div className="space-y-4">
          <div className="flex justify-between">
            <h3 className="text-lg font-semibold">Your Holidays</h3>
            <div className="space-x-2">
              <Button onClick={saveToFile} variant="outline">
                Save to File
              </Button>
              <Button onClick={loadFromFile} variant="outline">
                Load from File
              </Button>
            </div>
          </div>
          {entries.length === 0 ? (
            <p className="text-zinc-500 dark:text-zinc-400">No holidays added yet.</p>
          ) : (
            <ul className="space-y-2">
              {entries
                .toSorted((a, b) => b.year.localeCompare(a.year))
                .map((entry) => (
                <li
                  key={entry.id}
                  className="bg-zinc-100 p-2 rounded-md dark:bg-zinc-800 flex flex-row justify-between"
                >
                  <span>
                    {entry.month} {entry.year} - {entry.location}
                  </span>
                  <button
                    type="button"
                    onClick={() => deleteEntry(entry.id, entry.location)}
                    className="flex flex-row items-center gap-1 text-red-400"
                    aria-label={`Delete holiday to ${entry.location}`}
                  >
                    <Trash2Icon className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
