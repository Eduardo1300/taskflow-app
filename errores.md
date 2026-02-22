  driverError: error: relation "profiles" does not exist
      at /app/node_modules/pg/lib/client.js:624:17
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:181:25)
      at async SelectQueryBuilder.loadRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2231:25)
      at async SelectQueryBuilder.executeEntitiesAndRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2079:26)
      at async SelectQueryBuilder.getRawAndEntities (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:684:29)
      at async SelectQueryBuilder.getOne (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:711:25)
      at async AuthService.login (/app/dist/auth/auth.service.js:44:25)
Menu
      at async /app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
      at async /app/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
    length: 108,
    severity: 'ERROR',
    code: '42P01',
    detail: undefined,
    hint: undefined,
    position: '176',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '1466',
    routine: 'parserOpenTable'
  },
  length: 108,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '176',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1466',
  routine: 'parserOpenTable'
}
[Nest] 18  - 02/22/2026, 2:10:49 AM   ERROR [ExceptionsHandler] QueryFailedError: relation "profiles" does not exist
    at PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:216:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async SelectQueryBuilder.loadRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2231:25)
    at async SelectQueryBuilder.executeEntitiesAndRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2079:26)
    at async SelectQueryBuilder.getRawAndEntities (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:684:29)
    at async SelectQueryBuilder.getOne (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:711:25)
    at async AuthService.login (/app/dist/auth/auth.service.js:44:25)
    at async /app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at async /app/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
  query: 'SELECT "Profile"."id" AS "Profile_id", "Profile"."email" AS "Profile_email", "Profile"."created_at" AS "Profile_created_at", "Profile"."full_name" AS "Profile_full_name" FROM "profiles" "Profile" WHERE (("Profile"."email" = $1)) LIMIT 1',
  parameters: [
    'prueba@gmail.com'
  ],
  driverError: error: relation "profiles" does not exist
      at /app/node_modules/pg/lib/client.js:624:17
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:181:25)
      at async SelectQueryBuilder.loadRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2231:25)
      at async SelectQueryBuilder.executeEntitiesAndRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2079:26)
      at async SelectQueryBuilder.getRawAndEntities (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:684:29)
      at async SelectQueryBuilder.getOne (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:711:25)
      at async AuthService.login (/app/dist/auth/auth.service.js:44:25)
      at async /app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
      at async /app/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
    length: 108,
    severity: 'ERROR',
    code: '42P01',
    detail: undefined,
    hint: undefined,
    position: '176',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '1466',
    routine: 'parserOpenTable'
  },
  length: 108,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '176',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1466',
  routine: 'parserOpenTable'
}
[Nest] 18  - 02/22/2026, 2:10:50 AM   ERROR [ExceptionsHandler] QueryFailedError: relation "profiles" does not exist
    at PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:216:19)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at async SelectQueryBuilder.loadRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2231:25)
    at async SelectQueryBuilder.executeEntitiesAndRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2079:26)
    at async SelectQueryBuilder.getRawAndEntities (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:684:29)
    at async SelectQueryBuilder.getOne (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:711:25)
    at async AuthService.login (/app/dist/auth/auth.service.js:44:25)
    at async /app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
    at async /app/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
  query: 'SELECT "Profile"."id" AS "Profile_id", "Profile"."email" AS "Profile_email", "Profile"."created_at" AS "Profile_created_at", "Profile"."full_name" AS "Profile_full_name" FROM "profiles" "Profile" WHERE (("Profile"."email" = $1)) LIMIT 1',
  parameters: [
    'prueba@gmail.com'
  ],
  driverError: error: relation "profiles" does not exist
      at /app/node_modules/pg/lib/client.js:624:17
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
      at async PostgresQueryRunner.query (/app/node_modules/typeorm/driver/postgres/PostgresQueryRunner.js:181:25)
      at async SelectQueryBuilder.loadRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2231:25)
      at async SelectQueryBuilder.executeEntitiesAndRawResults (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:2079:26)
      at async SelectQueryBuilder.getRawAndEntities (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:684:29)
      at async SelectQueryBuilder.getOne (/app/node_modules/typeorm/query-builder/SelectQueryBuilder.js:711:25)
      at async AuthService.login (/app/dist/auth/auth.service.js:44:25)
      at async /app/node_modules/@nestjs/core/router/router-execution-context.js:46:28
      at async /app/node_modules/@nestjs/core/router/router-proxy.js:9:17 {
    length: 108,
    severity: 'ERROR',
    code: '42P01',
    detail: undefined,
    hint: undefined,
    position: '176',
    internalPosition: undefined,
    internalQuery: undefined,
    where: undefined,
    schema: undefined,
    table: undefined,
    column: undefined,
    dataType: undefined,
    constraint: undefined,
    file: 'parse_relation.c',
    line: '1466',
    routine: 'parserOpenTable'
  },
  length: 108,
  severity: 'ERROR',
  code: '42P01',
  detail: undefined,
  hint: undefined,
  position: '176',
  internalPosition: undefined,
  internalQuery: undefined,
  where: undefined,
  schema: undefined,
  table: undefined,
  column: undefined,
  dataType: undefined,
  constraint: undefined,
  file: 'parse_relation.c',
  line: '1466',
  routine: 'parserOpenTable'
}