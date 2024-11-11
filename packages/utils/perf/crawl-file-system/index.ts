import {bench, boxplot, run} from "mitata";
import {crawlFileSystemFsWalk} from "./fs-walk";
import {crawlFileSystem} from "../../src";

bench('Base', () => crawlFileSystem({directory: '../../../node_modules', pattern:'test'}));
bench('nodelib.fsWalk', () => crawlFileSystemFsWalk({directory: '../../../node_modules', pattern:'**'}));

boxplot(() => {
  bench('new Array($size)', function* (state) {
    const size = state.get('size');
    yield () => Array.from({ length: size });
  }).range('size', 1, 1024);
});

await run();
