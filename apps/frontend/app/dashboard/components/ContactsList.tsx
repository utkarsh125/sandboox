"use client"
import React from 'react'

interface Contact {
    id: string
    name: string
    avatar?: string
    initials?: string
    color?: string
}

interface ContactsListProps {
    contacts: Contact[]
}

const ContactsList: React.FC<ContactsListProps> = ({ contacts }) => {
    return (
        <div className="space-y-2">
            {contacts.map((contact) => (
                <div
                    key={contact.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                >
                    {contact.avatar ? (
                        <img
                            src={contact.avatar}
                            alt={contact.name}
                            className="w-8 h-8 rounded-full object-cover"
                        />
                    ) : (
                        <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: contact.color || '#6366f1' }}
                        >
                            {contact.initials || contact.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <span className="text-sm text-gray-700">{contact.name}</span>
                </div>
            ))}
        </div>
    )
}

export default ContactsList
