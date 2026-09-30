export function getCircularReplacer() {
  const seen = new WeakSet();
  return (key: string, value: any) => {
    try {
      if (typeof value === "object" && value !== null) {
        const cname = (value.constructor && typeof value.constructor.name === "string") ? value.constructor.name : "";
        if (
          cname.startsWith("Firestore") ||
          cname.startsWith("Document") ||
          cname.startsWith("Query") ||
          cname.startsWith("Collection") ||
          cname.startsWith("Firebase") ||
          cname.startsWith("HTML") ||
          cname === "Window" ||
          cname === "Sa" ||
          cname === "Q$1" ||
          (value.constructor && value.constructor !== Object && value.constructor !== Array && value.constructor !== Date && value.constructor !== RegExp)
        ) {
          return undefined;
        }
        if (seen.has(value)) {
          return undefined; // Discard circular references
        }
        seen.add(value);
      }
      return value;
    } catch (err) {
      return undefined;
    }
  };
}

export function removeCircularReferences(obj: any, seen = new WeakSet()): any {
  try {
    if (obj === null || typeof obj !== "object") {
      return obj;
    }
    const cname = (obj.constructor && typeof obj.constructor.name === "string") ? obj.constructor.name : "";
    if (
      cname.startsWith("Firestore") ||
      cname.startsWith("Document") ||
      cname.startsWith("Query") ||
      cname.startsWith("Collection") ||
      cname.startsWith("Firebase") ||
      cname.startsWith("HTML") ||
      cname === "Window" ||
      cname === "Sa" ||
      cname === "Q$1" ||
      (obj.constructor && obj.constructor !== Object && obj.constructor !== Array && obj.constructor !== Date && obj.constructor !== RegExp)
    ) {
      return null;
    }
    if (seen.has(obj)) {
      return null;
    }
    seen.add(obj);

    // We clone to avoid modifying the live object in-place during cleaning
    const isArray = Array.isArray(obj);
    const result: any = isArray ? [] : {};

    if (isArray) {
      for (let i = 0; i < obj.length; i++) {
        const val = obj[i];
        if (typeof val === "object" && val !== null) {
          if (seen.has(val)) {
            result[i] = null;
          } else {
            result[i] = removeCircularReferences(val, seen);
          }
        } else {
          result[i] = val;
        }
      }
    } else {
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          if (key === "firestore" || key === "firestoreDocRef" || key === "appInstance" || key === "chatProfileHelper") {
            continue;
          }
          const val = obj[key];
          if (typeof val === "object" && val !== null) {
            if (seen.has(val)) {
              result[key] = null;
            } else {
              result[key] = removeCircularReferences(val, seen);
            }
          } else {
            result[key] = val;
          }
        }
      }
    }
    seen.delete(obj);
    return result;
  } catch (e) {
    console.warn("Circular cleaning failed for node, returning original as best-effort:", e);
    return obj;
  }
}

export function safeStringify(obj: any, fallback = "{}"): string {
  try {
    return JSON.stringify(obj, getCircularReplacer());
  } catch (e) {
    console.warn("Failed to stringify object securely, retrying with deep clean:", e);
    try {
      const cleanObj = removeCircularReferences(obj);
      return JSON.stringify(cleanObj);
    } catch (deepErr) {
      console.error("Deep clean stringify completely failed:", deepErr);
      return fallback;
    }
  }
}
