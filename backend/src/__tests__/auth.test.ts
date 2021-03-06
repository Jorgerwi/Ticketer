import { Context, createMockContext, MockContext } from '../context';
import { loginHelper } from '../handlers/helpers/authHelper';
import { createUserHelper } from '../handlers/helpers/userHelper';
import { LoginRequest, RestResponse, TokenRestResponse, UserRequest } from '../types';

let mockCtx: MockContext;
let context: Context;

beforeEach(() => {
  mockCtx = createMockContext();
  context = mockCtx as unknown as Context;
});

describe('test register', () => {
  it('valid register', async () => {
    const user = {
      id: 5000,
      firstName: 'Hello',
      lastName: 'World',
      email: 'hello@world.com',
      password: 'HelloWorld!',
    };

    mockCtx.prisma.user.create.mockResolvedValue(user);

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(200);
      expect(message.message).toBe('User created!');
    }).catch((error: any) => console.log(error));
  });

  it('bad firstName', async () => {
    const user = {
      firstName: 'H',
      lastName: 'World',
      email: 'hello@world.com',
      password: 'HelloWorld!',
    };

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('Invalid firstname');
    }).catch((error: any) => console.log(error));
  });

  it('bad lastName', async () => {
    const user = {
      firstName: 'Hello',
      lastName: 'W',
      email: 'hello@world.com',
      password: 'HelloWorld!',
    };

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('Invalid lastname');
    }).catch((error: any) => console.log(error));
  });

  it('bad email', async () => {
    const user = {
      firstName: 'Hello',
      lastName: 'W',
      email: 'hello@world',
      password: 'HelloWorld!',
    };

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('Invalid email');
    }).catch((error: any) => console.log(error));
  });

  it('bad password', async () => {
    const user = {
      firstName: 'Hello',
      lastName: 'W',
      email: 'hello@world',
      password: 'Hello',
    };

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('Invalid password');
    }).catch((error: any) => console.log(error));
  });

  it('taken email', async () => {
    const user = {
      id: 5000,
      firstName: 'Hello',
      lastName: 'World',
      email: 'hello@world',
      password: 'HelloWorld!',
    };

    mockCtx.prisma.user.create.mockResolvedValue(user);

    createUserHelper(user as UserRequest, context).catch((error: any) => console.log(error));

    createUserHelper(user as UserRequest, context).then((message: RestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('User already exists');
    }).catch((error: any) => console.log(error));
  });
});

describe('test login', () => {
  it('valid login', async () => {
    const user = {
      id: 5000,
      firstName: 'Hello',
      lastName: 'World',
      email: 'hello@world.com',
      password: 'HelloWorld!',
    };

    const token = {
      id: 1000,
      createdAt: new Date(),
      ownerId: 5000,
      token: 'SuperSecureToken',
    };

    mockCtx.prisma.user.create.mockResolvedValue(user);
    mockCtx.prisma.user.findUnique.mockResolvedValue(user);
    mockCtx.prisma.token.upsert.mockResolvedValue(token);

    loginHelper(user as LoginRequest, context).then((message: RestResponse | TokenRestResponse) => {
      expect(message.message).toHaveProperty('id');
      expect(message.code).toBe(200);
      // expect((message as TokenRestResponse).message.id).toBe(5000);
    }).catch((error:any) => console.log(error));
  });

  it('bad password', async () => {
    const user = {
      id: 5000,
      firstName: 'Hello',
      lastName: 'World',
      email: 'hello@world.com',
      password: 'NotHelloWorld!',
    };

    mockCtx.prisma.user.findUnique.mockResolvedValue(user);

    loginHelper({ email: 'hello@world.com', password: 'yeet' }, context).then((message: RestResponse | TokenRestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('Wrong password');
    }).catch((error:any) => console.log(error));
  });

  it('bad email', async () => {
    const user = {
      id: 5000,
      firstName: 'Hello',
      lastName: 'World',
      email: 'nothello@notworld.com',
      password: 'NotHelloWorld!',
    };

    mockCtx.prisma.user.findUnique.mockRejectedValue(new Error('yeet'));

    loginHelper(user as LoginRequest, context).then((message: RestResponse | TokenRestResponse) => {
      expect(message.code).toBe(401);
      expect(message.message).toBe('User not found');
    }).catch((error:any) => console.log(error));
  });
});
