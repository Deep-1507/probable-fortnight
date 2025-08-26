import React, { useEffect, useMemo, useRef, useState } from "react";
const TEMPLATE_HIRING = {
  template_id: "001",
  category: "Hiring",
  elements: [
    {
      type: "text",
      value: "We are Hiring!",
      x: 50,
      y: 60,
      color: "#0A66C2",
      fontSize: 28,
    },
    {
      type: "text",
      value: "Join our team at Pulzr.ai",
      x: 50,
      y: 100,
      color: "#333333",
      fontSize: 18,
    },
    {
      type: "rectangle",
      x: 40,
      y: 40,
      width: 360,
      height: 100,
      color: "#E5E5E5",
    },
  ],
};

const TEMPLATE_ANNOUNCEMENT = {
  template_id: "002",
  category: "Announcement",
  elements: [
    {
      type: "rectangle",
      x: 20,
      y: 20,
      width: 460,
      height: 180,
      color: "#FFF6E5",
    },
    {
      type: "text",
      value: "Product Launch",
      x: 40,
      y: 80,
      color: "#E67E22",
      fontSize: 30,
    },
    {
      type: "text",
      value: "Version 2.0 rolling out this week!",
      x: 40,
      y: 130,
      color: "#2C3E50",
      fontSize: 18,
    },
  ],
};

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function downloadJSON(obj, filename = "template.json") {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function TemplateEditor() {
  const [template, setTemplate] = useState(TEMPLATE_HIRING);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState([deepClone(TEMPLATE_HIRING)]);
  const [future, setFuture] = useState([]);

  const canvasRef = useRef(null);
  const ctxRef = useRef(null);

  const width = 640;
  const height = 360;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    ctxRef.current = canvas.getContext("2d");
    draw();
  }, []);

  useEffect(() => {
    draw();
  }, [template, selectedIndex]);

  const draw = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    template.elements.forEach((el, i) => {
      if (el.type === "rectangle") {
        ctx.fillStyle = el.color || "#cccccc";
        ctx.fillRect(el.x, el.y, el.width, el.height);
        if (selectedIndex === i) {
          ctx.strokeStyle = "#000";
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(el.x, el.y, el.width, el.height);
          ctx.setLineDash([]);
        }
      } else if (el.type === "text") {
        ctx.fillStyle = el.color || "#000000";
        ctx.font = `${el.fontSize || 16}px Arial`;
        ctx.textBaseline = "alphabetic";
        ctx.fillText(el.value || "", el.x, el.y);
        if (selectedIndex === i) {
          const m = ctx.measureText(el.value || "");
          const boxW = m.width;
          const boxH = (el.fontSize || 16) * 1.2;
          ctx.strokeStyle = "#000";
          ctx.setLineDash([6, 4]);
          ctx.strokeRect(el.x, el.y - boxH + 4, boxW, boxH);
          ctx.setLineDash([]);
        }
      }
    });
  };

  const hitTest = (x, y) => {
    const ctx = ctxRef.current;
    if (!ctx) return null;

    for (let i = template.elements.length - 1; i >= 0; i--) {
      const el = template.elements[i];
      if (el.type === "rectangle") {
        if (x >= el.x && x <= el.x + el.width && y >= el.y && y <= el.y + el.height) {
          return { index: i, bounds: { x: el.x, y: el.y } };
        }
      } else if (el.type === "text") {
        ctx.font = `${el.fontSize || 16}px Arial`;
        const w = ctx.measureText(el.value || "").width;
        const h = (el.fontSize || 16) * 1.2;
        const top = el.y - h + 4;
        if (x >= el.x && x <= el.x + w && y >= top && y <= top + h) {
          return { index: i, bounds: { x: el.x, y: el.y } };
        }
      }
    }
    return null;
  };

  const canvasPoint = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onMouseDown = (e) => {
    const { x, y } = canvasPoint(e);
    const hit = hitTest(x, y);
    if (hit) {
      setSelectedIndex(hit.index);
      const el = template.elements[hit.index];
      setIsDragging(true);
      setDragOffset({ x: x - el.x, y: y - el.y });
    } else {
      setSelectedIndex(null);
    }
  };

  const onMouseMove = (e) => {
    if (!isDragging || selectedIndex === null) return;
    const { x, y } = canvasPoint(e);
    const updated = deepClone(template);
    updated.elements[selectedIndex].x = Math.round(x - dragOffset.x);
    updated.elements[selectedIndex].y = Math.round(y - dragOffset.y);
    setTemplate(updated);
  };

  const pushHistory = (nextTemplate) => {
    setHistory((prev) => [...prev, deepClone(nextTemplate)]);
    setFuture([]);
  };

  const onMouseUp = () => {
    if (isDragging) {
      pushHistory(template);
    }
    setIsDragging(false);
  };

  const onMouseLeave = () => {
    if (isDragging) {
      pushHistory(template);
      setIsDragging(false);
    }
  };

  const selectedEl = useMemo(
    () => (selectedIndex !== null ? template.elements[selectedIndex] : null),
    [selectedIndex, template]
  );

  const updateSelected = (patch) => {
    if (selectedIndex === null) return;
    const next = deepClone(template);
    next.elements[selectedIndex] = { ...next.elements[selectedIndex], ...patch };
    setTemplate(next);
    pushHistory(next);
  };

  const removeSelected = () => {
    if (selectedIndex === null) return;
    const next = deepClone(template);
    next.elements.splice(selectedIndex, 1);
    setTemplate(next);
    setSelectedIndex(null);
    pushHistory(next);
  };

  const addElement = (type) => {
    const next = deepClone(template);
    if (type === "rectangle") {
      next.elements.push({ type: "rectangle", x: 80, y: 80, width: 120, height: 60, color: "#cccccc" });
    } else if (type === "text") {
      next.elements.push({ type: "text", value: "New Text", x: 100, y: 100, color: "#000000", fontSize: 18 });
    }
    setTemplate(next);
    pushHistory(next);
  };

  const undo = () => {
    if (history.length <= 1) return;
    const prev = history[history.length - 2];
    setFuture((f) => [history[history.length - 1], ...f]);
    setHistory((h) => h.slice(0, h.length - 1));
    setTemplate(deepClone(prev));
  };

  const redo = () => {
    if (future.length === 0) return;
    const [next, ...rest] = future;
    setFuture(rest);
    setHistory((h) => [...h, deepClone(next)]);
    setTemplate(deepClone(next));
  };

  const onFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      setTemplate(json);
      setSelectedIndex(null);
      setHistory([deepClone(json)]);
      setFuture([]);
    } catch (err) {
      alert("Invalid JSON file");
    }
  };

  const saveJSON = () => {
    const name = template.template_id ? `template_${template.template_id}.json` : `template_${Date.now()}.json`;
    downloadJSON(template, name);
  };

  const exportMp4Dummy = () => {
    alert("Export to MP4 queued! (Dummy) — In a real system, this would render frames and encode to video.");
  };

  const switchTemplate = (key) => {
    const next = key === "hiring" ? TEMPLATE_HIRING : TEMPLATE_ANNOUNCEMENT;
    setTemplate(deepClone(next));
    setSelectedIndex(null);
    setHistory([deepClone(next)]);
    setFuture([]);
  };

  return (
   <div className="min-h-screen w-full bg-gradient-to-br from-slate-100 to-slate-200 p-6">
  <div className="mx-auto max-w-6xl">
    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-3">
      <h1 className="text-3xl font-bold text-slate-800 tracking-tight">
        Template Editor
      </h1>
      <div className="flex flex-wrap gap-3">
        <select
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onChange={(e) => switchTemplate(e.target.value)}
          defaultValue="hiring"
          title="Switch template"
        >
          <option value="hiring">Template 001 — Hiring</option>
          <option value="announcement">Template 002 — Announcement</option>
        </select>

        <label className="cursor-pointer rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400">
          Load JSON
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={onFileChange}
          />
        </label>

        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400"
          onClick={saveJSON}
        >
          Save JSON
        </button>
        
        <button
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm hover:border-slate-400"
          onClick={exportMp4Dummy}
        >
          Export to MP4 (dummy)
        </button>
      </div>
    </header>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-lg border border-slate-200">
        <div className="mb-4 flex gap-3">
          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white shadow hover:bg-blue-700"
            onClick={() => addElement("text")}
          >
            + Text
          </button>
          <button
            className="rounded-lg bg-green-600 px-3 py-2 text-sm text-white shadow hover:bg-green-700"
            onClick={() => addElement("rectangle")}
          >
            + Rectangle
          </button>
          <div className="ml-auto flex gap-3">
            <button
              className="rounded-lg bg-slate-200 px-3 py-2 text-sm shadow disabled:opacity-50 hover:bg-slate-300"
              onClick={undo}
              disabled={history.length <= 1}
            >
              Undo
            </button>
            <button
              className="rounded-lg bg-slate-200 px-3 py-2 text-sm shadow disabled:opacity-50 hover:bg-slate-300"
              onClick={redo}
              disabled={future.length === 0}
            >
              Redo
            </button>
          </div>
        </div>

        <div className="overflow-auto rounded-xl border border-slate-300 shadow-inner bg-slate-50">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="rounded-lg"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
          />
        </div>
      </div>

      <aside className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200">
        <h2 className="mb-4 text-lg font-semibold text-slate-700">Elements</h2>
        <ul className="space-y-2">
          {template.elements.map((el, idx) => (
            <li key={idx}>
              <button
                className={`w-full text-left rounded-lg border px-3 py-2 text-sm shadow-sm transition ${
                  selectedIndex === idx
                    ? "border-blue-500 bg-blue-50 ring-2 ring-blue-400"
                    : "border-slate-300 bg-white hover:border-slate-400"
                }`}
                onClick={() => setSelectedIndex(idx)}
                title="Select element"
              >
                #{idx + 1} — {el.type}
              </button>
            </li>
          ))}
        </ul>

        <hr className="my-5 border-slate-300" />

        {selectedEl ? (
          <div className="space-y-4">
            <h3 className="font-medium text-slate-600">Inspector</h3>

            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                X
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                  type="number"
                  value={selectedEl.x}
                  onChange={(e) =>
                    updateSelected({ x: parseInt(e.target.value || 0, 10) })
                  }
                />
              </label>
              <label className="text-sm">
                Y
                <input
                  className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                  type="number"
                  value={selectedEl.y}
                  onChange={(e) =>
                    updateSelected({ y: parseInt(e.target.value || 0, 10) })
                  }
                />
              </label>
            </div>

            {selectedEl.type === "rectangle" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    Width
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                      type="number"
                      value={selectedEl.width}
                      onChange={(e) =>
                        updateSelected({
                          width: parseInt(e.target.value || 0, 10),
                        })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Height
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                      type="number"
                      value={selectedEl.height}
                      onChange={(e) =>
                        updateSelected({
                          height: parseInt(e.target.value || 0, 10),
                        })
                      }
                    />
                  </label>
                </div>

                <label className="text-sm block">
                  Fill Color
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm"
                    type="color"
                    value={selectedEl.color}
                    onChange={(e) => updateSelected({ color: e.target.value })}
                  />
                </label>
              </>
            )}

            {selectedEl.type === "text" && (
              <>
                <label className="text-sm block">
                  Text
                  <input
                    className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm"
                    type="text"
                    value={selectedEl.value}
                    onChange={(e) => updateSelected({ value: e.target.value })}
                  />
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <label className="text-sm">
                    Font Size
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-300"
                      type="number"
                      value={selectedEl.fontSize || 16}
                      onChange={(e) =>
                        updateSelected({
                          fontSize: parseInt(e.target.value || 16, 10),
                        })
                      }
                    />
                  </label>
                  <label className="text-sm">
                    Color
                    <input
                      className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1 text-sm shadow-sm"
                      type="color"
                      value={selectedEl.color}
                      onChange={(e) => updateSelected({ color: e.target.value })}
                    />
                  </label>
                </div>
              </>
            )}

            <div className="pt-2">
              <button
                className="rounded-lg bg-red-500 px-3 py-2 text-sm text-white shadow hover:bg-red-600"
                onClick={removeSelected}
              >
                Delete Element
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">
            Select an element to edit its properties.
          </p>
        )}
      </aside>
    </div>

    <footer className="mt-8 text-center text-xs text-slate-500">
      <p>
        💡 Tip: Drag elements on the canvas. Use Undo/Redo to step through
        changes. Save JSON to download the current state. MP4 export is dummy.
      </p>
    </footer>
  </div>
</div>

  );
}