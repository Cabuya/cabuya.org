import { type CollectionEntry, getCollection } from 'astro:content';

export type Ally = CollectionEntry<'allies'>;
export type AllyKind = Ally['data']['kind'];

const sortByOrderThenName = (a: Ally, b: Ally): number => {
  const oa = a.data.order ?? 0;
  const ob = b.data.order ?? 0;
  if (oa !== ob) return oa - ob;
  return a.data.name.localeCompare(b.data.name);
};

export const sortAllies = (allies: Ally[]): Ally[] =>
  [...allies].sort(sortByOrderThenName);

export const getAllies = async (): Promise<Ally[]> => {
  const all = await getCollection('allies');
  return sortAllies(all);
};

export const getAlliesByKind = async (kind: AllyKind): Promise<Ally[]> => {
  const all = await getAllies();
  return all.filter((a) => a.data.kind === kind);
};
