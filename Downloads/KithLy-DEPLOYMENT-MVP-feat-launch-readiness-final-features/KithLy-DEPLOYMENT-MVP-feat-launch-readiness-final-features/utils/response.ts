export class NextResponse {
    constructor(body?: BodyInit | null, init?: ResponseInit) {
      return new Response(body, init);
    }

    static json(body: any, init?: ResponseInit) {
      const headers = new Headers(init?.headers);
      headers.set('Content-Type', 'application/json');
      return new NextResponse(JSON.stringify(body), { ...init, headers });
    }
  }
