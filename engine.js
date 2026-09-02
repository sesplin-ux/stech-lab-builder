/* ============================================================
   STECH Lab Engine — the single source of the competency rules.

   Loaded by Student.html (Fill) and Grader.html (Grade) — and
   available to Builder.html (Preview) — as a CLASSIC script:
       <script src="engine.js"></script>
   Keep it classic (a global, not an ES module): these tools run by
   double-click over file://, where ES modules are CORS-blocked but
   classic scripts load fine from the same folder. engine.js must sit
   next to the HTML files.

   One place defines what "complete" means, so Fill, Grade, and Preview
   can never disagree. UI/presentation stays in each app; only the
   RULES live here.
   ============================================================ */
(function (global) {
  "use strict";

  /* Non-empty entries in a list value. */
  function listFilled(v) {
    return Array.isArray(v) ? v.filter(function (x) { return String(x || "").trim(); }).length
                            : (String(v || "").trim() ? 1 : 0);
  }

  /* How many list lines must be filled to satisfy a REQUIRED list.
     Default 1 — one entry counts as met. An instructor can require more
     on the field: requireAll -> every line, or minEntries -> a set number. */
  function requiredListCount(f) {
    if (f.requireAll) return f.count || 3;
    return (f.minEntries && f.minEntries > 0) ? f.minEntries : 1;
  }

  /* A vehicle counts as recorded when it has a VIN, or a Year+Make+Model. */
  function vehicleRecorded(veh) {
    if (!veh) return false;
    if (veh.mode === "vin") return !!String(veh.vin || "").trim();
    return !!(String(veh.year || "").trim() && String(veh.make || "").trim() && String(veh.model || "").trim());
  }

  function fieldEmpty(f, v) {
    if (f && f.type === "list") return listFilled(v) < requiredListCount(f);
    return v == null || String(v).trim() === "";
  }

  /* Canonical per-field evaluation — the one place the rules live.
     Returns { state, need?, have?, expected?, tol? }.
       missing        required & empty (or required list short of its count)
       empty-optional not required & empty
       correct        number w/ answer key, filled, within tolerance
       incorrect      number w/ answer key, filled, outside tolerance
       review         required & filled but subjective (no key) -> spot-check
       good           optional & filled (nothing to auto-judge)
     Only 'missing' and 'incorrect' block competency; 'review' counts as met.
     Answer keys only exist on concrete-number fields — every other field is
     completion-only and gets an instructor spot-check. */
  function evalField(f, resp) {
    var v = resp ? resp[f.id] : undefined;
    if (f.type === "list") {
      var need = requiredListCount(f), have = listFilled(v);
      if (f.required && have < need) return { state: "missing", need: need, have: have };
      if (have > 0) return { state: f.required ? "review" : "good" };
      return { state: "empty-optional" };
    }
    var empty = (v == null || String(v).trim() === "");
    if (f.required && empty) return { state: "missing" };
    if (empty) return { state: "empty-optional" };
    if (f.type === "number" && f.checkAnswer && f.expectedValue != null) {
      var n = Number(v), tol = Number(f.tolerance != null ? f.tolerance : 0.01);
      if (!isNaN(n)) return { state: Math.abs(n - Number(f.expectedValue)) <= tol ? "correct" : "incorrect", expected: f.expectedValue, tol: tol };
    }
    return { state: f.required ? "review" : "good" };
  }

  /* Whole-lab competency evaluation. ctx = { responses, checkoffs, vehicle }.
     Returns { complete, unmet:[{id,label,reason,need?,have?}], fields:[{f,res}] }.
     reason: 'required' | 'incorrect' | 'vehicle' | 'checkoff'. */
  function evaluate(lab, ctx) {
    ctx = ctx || {};
    var resp = ctx.responses || {}, checks = ctx.checkoffs || [];
    var unmet = [], fields = [];
    if (lab.requiresVehicle && !vehicleRecorded(ctx.vehicle)) unmet.push({ id: "__vehicle", label: "Vehicle", reason: "vehicle" });
    (lab.fields || []).forEach(function (f) {
      var res = evalField(f, resp);
      fields.push({ f: f, res: res });
      if (res.state === "missing") unmet.push({ id: f.id, label: f.label || f.id, reason: "required", need: res.need, have: res.have });
      else if (res.state === "incorrect") unmet.push({ id: f.id, label: f.label || f.id, reason: "incorrect" });
    });
    var comp = lab.competency || {};
    if (comp.countCheckoffs) {
      (lab.steps || []).forEach(function (s, i) {
        if (s.checkbox && checks.indexOf(i) < 0) unmet.push({ id: "step" + i, label: "Step " + (i + 1), reason: "checkoff" });
      });
    }
    return { complete: unmet.length === 0, unmet: unmet, fields: fields };
  }

  /* Inline student-facing field mark. Layers the "touched" gate on top of
     evalField so a required-empty field reads as a neutral "to do" until the
     student interacts with it. Returns: todo | miss | ansok | ansno | "". */
  function fieldMark(f, resp, touched) {
    var res = evalField(f, resp);
    if (res.state === "missing") return touched ? "miss" : "todo";
    if (res.state === "incorrect") return "ansno";
    if (res.state === "correct") return "ansok";
    return "";
  }

  global.LabEngine = {
    listFilled: listFilled,
    requiredListCount: requiredListCount,
    vehicleRecorded: vehicleRecorded,
    fieldEmpty: fieldEmpty,
    evalField: evalField,
    evaluate: evaluate,
    fieldMark: fieldMark,
    VERSION: 1
  };
})(typeof window !== "undefined" ? window : this);
