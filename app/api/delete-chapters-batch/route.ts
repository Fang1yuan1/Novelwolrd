import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(req: NextRequest) {
  try {
    const { novelId } = await req.json();

    if (!novelId) {
      return NextResponse.json(
        { error: 'novel_id مطلوب' },
        { status: 400 }
      );
    }

    // حذف جميع الفصول على دفعات (500 فصل في كل دفعة)
    const BATCH_SIZE = 500;
    let totalDeleted = 0;

    while (true) {
      // احصل على أول 500 فصل
      const { data: chapters, error: fetchError } = await supabase
        .from('chapters')
        .select('id')
        .eq('novel_id', novelId)
        .limit(BATCH_SIZE);

      if (fetchError) {
        console.error('خطأ في جلب الفصول:', fetchError);
        return NextResponse.json(
          { error: 'خطأ في جلب الفصول: ' + fetchError.message },
          { status: 500 }
        );
      }

      if (!chapters || chapters.length === 0) {
        break; // لا توجد فصول أخرى للحذف
      }

      const ids = chapters.map(c => c.id);

      // احذف هذه الدفعة
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .in('id', ids);

      if (deleteError) {
        console.error('خطأ في حذف الفصول:', deleteError);
        return NextResponse.json(
          { 
            error: 'خطأ في حذف الفصول',
            message: deleteError.message,
            deletedSoFar: totalDeleted
          },
          { status: 500 }
        );
      }

      totalDeleted += ids.length;

      // إذا كانت الدفعة أقل من BATCH_SIZE، انتهينا
      if (chapters.length < BATCH_SIZE) {
        break;
      }
    }

    return NextResponse.json({
      success: true,
      totalDeleted,
      message: `تم حذف ${totalDeleted} فصل بنجاح`
    });

  } catch (error) {
    console.error('خطأ في الـ API:', error);
    return NextResponse.json(
      { error: 'خطأ في الخادم: ' + String(error) },
      { status: 500 }
    );
  }
}
