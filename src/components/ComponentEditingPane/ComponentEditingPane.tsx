import { SERVER_URL } from "@/util/constants";
import { ProjectWithFiles } from "@/util/storage";
import React, { useEffect, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import {
  editingComponent,
  editingPopoverTarget,
} from "../PreviewRenderer/preview-renderer-state";
import classNames from "classnames";
import TimerProgressBar from "../TimerProgressBar/TimerProgressBar";
import CodeEditor from "../CodeEditor/CodeEditor";

export interface ComponentEditingPaneProps {
  project: ProjectWithFiles;
  onUpdate: (newContent: string) => void;
  onMessage: (message: string) => void;
}

function ComponentEditingPane({
  project,
  onUpdate,
  onMessage,
}: ComponentEditingPaneProps) {
  const [modification, setModification] = useState("");
  const editingComponentValue = useRecoilValue(editingComponent);
  const setEditingPopoverTarget = useSetRecoilState(editingPopoverTarget);
  const [loading, setLoading] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>("");
  const [codeChanged, setCodeChanged] = useState(false);

  useEffect(() => {
    if (editingComponentValue?.name) {
      const file = project.files.find(
        (f) => f.path === editingComponentValue.name
      );
      setCurrentCode(file?.contents!);
      setCodeChanged(false);
    }
  }, [project, editingComponentValue?.name]);

  async function updateComponent() {
    setLoading(true);

    const res = await fetch(
      `${SERVER_URL}/api/projects/${project.id}/files/${editingComponentValue?.name}`,
      {
        method: "PUT",
        body: JSON.stringify({
          modification,
          contents: codeChanged ? currentCode : undefined,
        }),
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const json = await res.json();
    onUpdate(json.file);
    if (json.message) onMessage(json.message);
    setModification("");
    setLoading(false);
  }

  if (!editingComponentValue) {
    return null;
  }

  return (
    <>
      <h1
        className={classNames("font-semibold text-lg flex flex-row", {
          "pb-4": !loading,
        })}
      >
        {editingComponentValue.name}
        <span className="flex-1" />
        <button
          className="text-slate-500 hover:text-slate-600 text-2xl"
          onClick={() => setEditingPopoverTarget(null)}
        >
          ×
        </button>
      </h1>
      <textarea
        className={classNames(
          "transition-all w-full bg-slate-50 shadow-inner text-slate-900 rounded-lg",
          {
            "h-0 p-0 overflow-hidden": loading,
            "p-2 min-h-[2em]": !loading,
          }
        )}
        value={modification}
        placeholder="Describe changes..."
        onChange={(e) => setModification(e.target.value)}
        disabled={loading}
      />
      <div
        className={classNames(
          "transition-all overflow-hidden flex items-center justify-center text-center",
          {
            "h-0": !loading,
            "h-16": loading,
          }
        )}
      >
        {loading && (
          <TimerProgressBar duration={20} caption="Rewriting component..." />
        )}
      </div>
      {!loading && <div className="italic my-2">Or edit directly below:</div>}
      <div className="overflow-auto bg-slate-50 shadow-inner text-slate-900 rounded-lg mb-4">
        {/* <Editor
          onValueChange={(newVal) => {
            setCurrentCode(newVal);
            setCodeChanged(true);
          }}
          highlight={(code) => highlight(code, languages.jsx, "jsx")}
          padding={8}
          className={classNames("w-full", {
            "h-0 p-0": loading,
          })}
          value={currentCode!}
          disabled={loading}
        /> */}
        <CodeEditor value={currentCode} />
      </div>
      <button
        className="w-full bg-slate-50 hover:bg-slate-200 active:bg-slate-300 shadow-md text-slate-900 p-1 rounded-lg disabled:opacity-20 font-semibold"
        onClick={updateComponent}
        disabled={loading}
      >
        Update
      </button>
    </>
  );
}

export default ComponentEditingPane;
