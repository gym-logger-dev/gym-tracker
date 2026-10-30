begin;
select plan(1);
select ok(true, 'smoke');
select * from finish();
rollback;
