export interface UseCase<P, R> {
  call(params: P): Promise<R>
}
