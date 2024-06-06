export type WithRequired<Type, Key extends keyof Type> = Type & { [Prop in Key]-?: Type[Prop] }

export type WithOptional<Type, Key extends keyof Type> = Type & { [Prop in Key]+?: Type[Prop] }

export type PickRequired<Type, Key extends keyof Type> = Pick<Type & { [Prop in Key]-?: Type[Prop] }, Key>

export type PickOptional<Type, Key extends keyof Type> = Pick<Type & { [Prop in Key]+?: Type[Prop] }, Key>

export type CamelCase<S extends string> = S extends `${infer P1}_${infer P2}${infer P3}`
  ? `${Lowercase<P1>}${Uppercase<P2>}${CamelCase<P3>}`
  : Lowercase<S>

export type KeysToCamelCase<T> = {
    [K in keyof T as CamelCase<string &K>]: T[K] extends {} ? KeysToCamelCase<T[K]> : T[K]
}