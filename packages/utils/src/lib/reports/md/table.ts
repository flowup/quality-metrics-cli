import { Table } from '@code-pushup/models';
import { tableToFlatArray } from '../../transform';
import { NEW_LINE } from '../constants';
import {paragraphs} from "./paragraphs";

export type Alignment = 'l' | 'c' | 'r';
const alignString = new Map<Alignment, string>([
  ['l', ':--'],
  ['c', ':--:'],
  ['r', '--:'],
]);

function tableRow(rows: (string | number)[]): string {
  return `|${rows.join('|')}|`;
}

/**
 * | Table Header 1  | Table Header 2 |
 * | --------------- | -------------- |
 * |  String 1       |  1             |
 * |  String 1       |  2             |
 * |  String 1       |  3             |
 */
export function tableMd<T extends Table>(data: T): string {
  const { rows = [], alignment } = data;
  if (rows.length === 0) {
    throw new Error("Data can't be empty");
  }

  const stringArr = tableToFlatArray(data);

  const allCenterAlignments = (
    typeof rows.at(0) === 'string'
      ? Array.from({ length: rows.length })
      : Object.keys(rows.at(0) ?? {})
  ).map(() => 'c' as Alignment);
  const alignmentSetting =
    alignment == null ? allCenterAlignments : alignment.map(align => align);

  const alignmentRow = alignmentSetting.map(s => alignString.get(s) ?? String(alignString.get('c')));

  return paragraphs(
    tableRow(stringArr.at(0) ?? []),
    tableRow(alignmentRow),
    ...stringArr.slice(1).map(tableRow)
  );
}

export function tableHtml(data: Table): string {
  if (data.rows.length === 0) {
    throw new Error("Data can't be empty");
  }

  // @TODO add formatting
  const tableContent = tableToFlatArray(data).map((arr, index) => {
    if (index === 0) {
      const headerRow = arr.map(s => `<th>${s}</th>${NEW_LINE}`).join('');
      return `<tr>${headerRow}</tr>${NEW_LINE}`;
    }
    const row = arr.map(s => `<td>${s}</td>${NEW_LINE}`).join('');
    return `<tr>${row}</tr>${NEW_LINE}`;
  });
  return `<table>${NEW_LINE}${tableContent.join('')}</table>`;
}
