
import React from 'react';
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

interface TradeNotesFieldsProps {
  notes: string;
  setNotes: (value: string) => void;
  screenshotUrl: string;
  setScreenshotUrl: (value: string) => void;
}

const TradeNotesFields: React.FC<TradeNotesFieldsProps> = ({
  notes,
  setNotes,
  screenshotUrl,
  setScreenshotUrl
}) => {
  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea 
          id="notes" 
          value={notes} 
          onChange={(e) => setNotes(e.target.value)}
          placeholder="What did you learn from this trade?"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="screenshotUrl">Screenshot URL</Label>
        <Input 
          id="screenshotUrl" 
          value={screenshotUrl} 
          onChange={(e) => setScreenshotUrl(e.target.value)}
          placeholder="URL to your trade screenshot"
        />
      </div>
    </>
  );
};

export default TradeNotesFields;
