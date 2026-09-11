import React from 'react';
import Link from 'next/link';
import { getAllNote } from '@/lib/redis';
import SidebarNoteList from './SidebarNoteList'

export default async function Sidebar() {
  const notes = await getAllNote();
  console.log(notes);
  return (
    <>
      {/* // Sidebar
      // 区块 电商网站，商品介绍，商品评论，图片，售价....
      // 语义是独立的一块内容区域 幻灯区域 */}
      <section className='col sidebar'>
        <Link href="/" className='sidebar-header'>
          <img
            className='logo'
            src='/logo.svg'
            width={"22px"}
            height={"20px"}
            role='presentation'
          />
          <strong>LLM Note</strong>
        </Link>
        <section className="sidebar-menu" role="menubar">
          {/* SideSearchField  未来干*/}
          <nav>
            {/* SidebarNodeList */}
            <SidebarNoteList notes={notes} />
          </nav>
        </section>
      </section>
    </>
  )
}
