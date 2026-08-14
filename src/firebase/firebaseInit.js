/**
 * Firebase compatibility wrapper.
 *
 * The project previously had a second Firebase configuration here with
 * placeholder values. That could point Storage/Auth at a different project.
 * Keep this file temporarily so existing imports continue to work, but use
 * the single real configuration from src/lib/firebase.ts.
 */
export { default, db, auth, storage } from "../lib/firebase.ts";
