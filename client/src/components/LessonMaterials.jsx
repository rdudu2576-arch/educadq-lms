import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileDown, FolderOpen } from "lucide-react";
function convertDriveLink(url) {
    // Convert drive.google.com/file/d/ID/view to drive.google.com/uc?export=view&id=ID
    var match = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match) {
        return "https://drive.google.com/uc?export=view&id=".concat(match[1]);
    }
    // Convert drive.google.com/open?id=ID
    var match2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    if (match2) {
        return "https://drive.google.com/uc?export=view&id=".concat(match2[1]);
    }
    return url;
}
export default function LessonMaterials(_a) {
    var materials = _a.materials;
    if (!materials || materials.length === 0)
        return null;
    return (<Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2 text-lg">
          <FolderOpen className="w-5 h-5 text-cyan-500"/>
          Materiais Complementares
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {materials.map(function (m, i) {
            var rawLink = m.drive_link || m.driveLink || m.url || "#";
            var link = convertDriveLink(rawLink);
            return (<a key={m.id || i} href={link} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors group">
                <FileDown className="w-5 h-5 text-cyan-500 group-hover:text-cyan-400"/>
                <span className="text-slate-200 group-hover:text-white">
                  {m.name || "Material sem nome"}
                </span>
              </a>);
        })}
        </div>
      </CardContent>
    </Card>);
}
