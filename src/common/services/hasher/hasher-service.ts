export interface HasherService<T = string> {
  hash(clearTxt: T): Promise<T>
  compare(clearTxt: T, hashedTxt: T): Promise<boolean>
}
