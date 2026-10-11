-- يسمح بتصنيف «الكل» للمنشورات (يظهر بكل التصنيفات). شغّله مرة واحدة.
alter table community_posts drop constraint if exists community_posts_kind_check;
alter table community_posts add constraint community_posts_kind_check
  check (kind in ('all','discussion','review','merch','share','fanwork','other'));
